import { Hono } from "hono";
import checkJWT from "../middleware/checkJWT";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";

interface PostProps {
  user: {
    email: string;
    name: string;
    id: string;
  };
}

const postRouter = new Hono<{ Variables: PostProps }>();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const prisma = new PrismaClient();

postRouter.get("/private", checkJWT(), async (c) => {
  try {
    const userToken = c.get("user");
    console.log("userToken", userToken);

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

    console.log("getUser", user);
    console.log("user.id", user?.id);

    //植物の状態を喋らす
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const species = "ラディッシュ";
    const sunlight = 100;
    const water = 100;
    const temperature = 20;
    const humidity = 50;
    const character = "モスモス";

    let res = "";

    const prompt = `
    植物の状態を1行で喋ってください。
    植物の種類は${species}です。
    日光は${sunlight}です。
    水分は${water}です。
    温度は${temperature}です。
    湿度は${humidity}です。

    では次の形式で返答してください。

    {
      "message": "植物の状態を1行で喋ってください。"
    }

    `;

    
    const response = await model.generateContent(prompt);

    console.log("response", response);
    const responseText = response.response?.candidates?.[0].content?.parts?.[0]?.text?.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
    console.log("responseText", responseText);

    //今日の誕生花
    const today = new Date();
    console.log("today",today)

    const todayFormat = format(today, "yyyy-MM-dd");
    console.log("todayFormat",todayFormat)

    const modelFlower = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const promptFlower = `
    あなたはゲームのキャラクターです。可愛く${todayFormat}の誕生花を教えてください。


    `;

    
    const responseFlower = await modelFlower.generateContent(promptFlower);

    console.log("responseFlower", responseFlower);
    const responseTextFlower = responseFlower.response?.candidates?.[0].content?.parts?.[0]?.text?.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
    console.log("responseTextFlower", responseTextFlower);

    if(responseText){
    const responseJson =  JSON.parse(responseText);

    return c.json({ message: "認証が成功しました", user, responseJson , responseTextFlower});
    }
    else{
      return c.json({ error: "メッセージが見つかりませんでした"},500 );
    }
    

    // return c.json(auth);
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default postRouter;
