import { Hono } from "hono";
import checkJWT from "../middleware/checkJWT";
import { PrismaClient } from "@prisma/client";
import { use } from "hono/jsx";
import { serve } from "bun";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cors } from "hono/cors";

interface PostProps {
  user: {
    email: string;
    name: string;
    id: string;
  };
}

const chatRouter = new Hono<{ Variables: PostProps }>();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const prisma = new PrismaClient();

chatRouter.post("/chat", checkJWT(), async (c) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const userToken = c.get("user");

    const { message } = await c.req.json();
    const chatHistoryAllData = await prisma.chatLog.findMany();

    //チャット履歴を取得
    const chatHistory = chatHistoryAllData.map((log) => {
      return {
        role: log.sender,
        parts: [{ text: log.message }],
      };
    });

    //ユーザーを取得
    const user = await prisma.user.findUnique({
      where: {
        email: userToken.email,
      },
      include: {
        plants: true,
        diaries: true,
        waterLogs: true,
      },
    });

    if (!user) {
      return c.json({ error: "ユーザーが見つかりません" }, 404);
    }
    if (!message) {
      return c.json({ error: "メッセージが空です" }, 400);
    }

    await prisma.chatLog.create({
      data: {
        userId: user.id,
        message: message,
        sender: "user",
      },
    });

    const chat = model.startChat({
      history: chatHistory,
    });

    const species = "ラディッシュ";
    const sunlight = 100;
    const water = 100;
    const temperature = 20;
    const humidity = 50;
    const character = "モスモス";

    const prompt = `
    あなたは植物を育成するゲームのキャラクターです。
    名前は「${character}」という植物の妖精です。
    植物の種類は「${species}」です。
 
    ユーザーから送られてくるメッセージは${message}です。
    ユーザーと会話してください。
    あまり長文では返答しないでください。
    `;

    const msgWithPrompt = `${prompt}\n${message}`;

    const result = await chat.sendMessage(msgWithPrompt);
    const response = await result.response;
    const text = response.text();

    //role: "model" → AIの返答であることを示す //parts: [{ text }] → 実際のレスポンス (text) を parts の配列に入れる

    await prisma.chatLog.create({
      data: {
        userId: user.id,
        message: text,
        sender: "model",
      },
    });

    return c.json({ text });

    // return c.json(auth);
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: "An error occurred" }, 500);
  }
});

chatRouter.get("/getChatHistory", checkJWT(), async (c) => {
  const userToken = c.get("user");


  //ユーザーを取得
  const user = await prisma.user.findUnique({
    where: {
      email: userToken.email,
    },
    include: {
      plants: true,
      diaries: true,
      waterLogs: true,
    },
  });

  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }

  const chatHistoryModel = await prisma.chatLog.findMany({
    where: {
      sender: "model",
      userId: user.id,
    },
  });

  const chatHistoryUser = await prisma.chatLog.findMany({
    where: {
      sender: "user",
      userId: user.id,
    },
  });

  //チャット履歴を取得
  return c.json({
    chatHistoryModel: chatHistoryModel,
    chatHistoryUser: chatHistoryUser,
  });
});
export default chatRouter;
