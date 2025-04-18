import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import * as jsonwebtoken from "jsonwebtoken";
import { GenerateContentResult, GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";
import { Context, Next } from "hono";
import { createFactory, createMiddleware } from "hono/factory";


export const runtime = "nodejs";

export interface UserPayload {
  email: string;
  id: string;
  name: string;
}

export type Env = {
  Variables: {
    user: UserPayload;
  };
};

const app = new Hono<Env>().basePath("/api");
const prisma = new PrismaClient();

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.use(
  cors({
    origin: "*",
  })
);

interface PostProps {
  user: {
    email: string;
    name: string;
    id: string;
  };
}

const checkJWT = () => {
  const factory = createFactory<Env>();
  return factory.createMiddleware(async (c, next) => {
    const token = c.req.header("x-auth-token");

    if (!token) {
      return c.json({ error: "権限がありません" }, 400);
    }
    try {
      //veryfyでデコードさせる->加工した "SECRET_KEY"を解凍
      //tokenと"secret_key"が一緒だったらuserを取り出す
      const user = (await jsonwebtoken.verify(
        token,
        "SECRET_KEY"
      )) as UserPayload;
      c.set("user", user);

      await next();
    } catch {
      return c.json({ error: "権限がありません" }, 400);
    }
  });
};

app.get("/auth", async (c) => {
  try {
    const auth = await prisma.user.findMany();
    return c.json(auth);
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/auth/register", async (c) => {
  const getUser = await c.req.json();
  const email = getUser.email;
  const name = getUser.name;
  const password = getUser.password;
  const species = getUser.species;
  const speciesName = getUser.speciesName;

  if (!email) {
    return c.json({ error: "emailを登録してください" }, 400);
  }
  if (!name) {
    return c.json({ error: "名前を登録してください" }, 400);
  }
  if (!password) {
    return c.json({ error: "パスワードを登録してください" }, 400);
  }

  //prismaschemaからuserを取得、getUser.emailで得たemailと一致したらtrue
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (user) {
    return c.json({ error: "すでにそのユーザーは存在しています" }, 400);
  }

  //パスワードの暗号化
  //saltRoundsは大体10
  const hashedPassword = await argon2.hash(password);

  //dbへ保存
  await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      plants: {
        create: {
          species: species,
          speciesName: speciesName,
        },
      },
    },
  });
  //   return c.json(createUser);

  //"SECRET_KEY"をもとに加工
  //クライアントへのjsonwebtokenの発行
  const token = await jsonwebtoken.sign(
    {
      email,
    },
    "SECRET_KEY", //.envに
    {
      expiresIn: "24h",
    }
  );
  return c.json({
    token: token,
  });
});

app.post("/auth/login", async (c) => {
  const { email, name, password } = await c.req.json();

  const user = await prisma.user.findFirst({
    where: { AND: [{ email: email }, { name: name }] },
  
  });

  if (!user) {
    return c.text("そのユーザーは存在しません");
  }

  //パスワードの復号、照合
  //compareで復号
  const isMatch = await argon2.verify(user.password, password);

  if (!isMatch) {
    return c.json({ error: "パスワードが異なります" }, 400);
  }

  //"SECRET_KEY"をもとに加工
  const token = await jsonwebtoken.sign(
    {
      email,
    },
    "SECRET_KEY",
    {
      expiresIn: "24h",
    }
  );
  return c.json({
    token: token,
  });
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");


app.get("/post/private", checkJWT(), async (c) => {
  try {
    const userToken = c.get("user");

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

    console.log("prompt")
    const response = await model.generateContent(prompt).catch((err) => console.log("error",err));

    console.log("response", response);
    
    const errorresponse = response as GenerateContentResult;
    const responseText =
      errorresponse.response?.candidates?.[0].content?.parts?.[0]?.text
        ?.replace(/```json\n?/, "")
        .replace(/\n?```/, "")
        .trim();
    console.log("responseText", responseText);

    //今日の誕生花
    const today = new Date();
    console.log("today", today);

    const todayFormat = format(today, "yyyy-MM-dd");
    console.log("todayFormat", todayFormat);

    const modelFlower = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const promptFlower = `
    あなたはゲームのキャラクターです。可愛く${todayFormat}の誕生花を教えてください。
    80文字までで話して

    `;

    const responseFlower = await modelFlower.generateContent(promptFlower);

    console.log("responseFlower", responseFlower);
    const responseTextFlower =
      responseFlower.response?.candidates?.[0].content?.parts?.[0]?.text
        ?.replace(/```json\n?/, "")
        .replace(/\n?```/, "")
        .trim();
    console.log("responseTextFlower", responseTextFlower);

    if (responseText) {
      const responseJson = JSON.parse(responseText);

      return c.json({
        message: "認証が成功しました",
        user,
        responseJson,
        responseTextFlower,
      });
    } else {
      return c.json({ error: "メッセージが見つかりませんでした" }, 500);
    }

    // return c.json(auth);
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/calendar", checkJWT(), async (c) => {
  const { date, month, event, diary } = await c.req.json();
  console.log(
    "date, month, event.emoji, event.growth, diary",
    date,
    month,
    event.emoji,
    event.growth,
    event.diary
  );

  const now = new Date();
  const nowYear = now.getFullYear();

  console.log("nowYear", nowYear);

  const userToken = c.get("user");
  console.log("userToken", userToken);

  const SaveData = new Date(nowYear, month - 1, date + 1);
  console.log("SaveData", SaveData);
  const allData = await prisma.user.findUnique({
    where: {
      email: userToken.email,
    },
    include: {
      plants: true,
      diaries: true,
      waterLogs: true,
    },
  });
  console.log("allData?.plants[0].id", allData?.plants[0].id);

  if (!allData) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }

  const eventHistory = await prisma.diary.findFirst({
    where: {
      recordedAt: SaveData,
    },
  });

  console.log("eventHistory", eventHistory);

  if (eventHistory) {
    await prisma.diary.update({
      where: {
        id: eventHistory.id,
      },
      data: {
        healthState: event.emoji,
        growthState: event.growth,
        content: event.diary,
      },
    });
  } else {
    await prisma.diary.create({
      data: {
        plantId: allData?.plants[0].id,
        healthState: event.emoji,
        recordedAt: SaveData,
        userId: allData.id,
        content: event.diary,
        growthState: event.growth,
      },
    });
  }

  return c.json(allData);
});

app.get("/calendar/getCalendar", checkJWT(), async (c) => {
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

  console.log("user", user);

  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }
  const eventHistory = await prisma.diary.findMany({
    where: {
      userId: user.id,
    },
  });

  console.log("eventHistory", eventHistory);
  eventHistory.map((event) => {
    console.log("event", event.recordedAt);
    console.log("event", typeof event.recordedAt);

    console.log("day", event.recordedAt.getDate() - 2);
    console.log("month", event.recordedAt.getMonth() + 1);
    console.log("month", event.recordedAt.getFullYear());

    //console.log("SaveData",SaveData);
    const SaveData = new Date(
      event.recordedAt.getDate() - 2,
      event.recordedAt.getMonth() + 1,
      event.recordedAt.getFullYear()
    );
    console.log("SaveData", SaveData);
  });
  console.log("eventHistory", typeof eventHistory);

  return c.json({ eventHistory });
});


// app.get("/chat/start", checkJWT(), async (c) => {
//   const userToken = c.get("user");
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


//     //ユーザーを取得
//     const user = await prisma.user.findUnique({
//       where: {
//         email: userToken.email,
//       },
//       include: {
//         plants: true,
//         diaries: true,
//         waterLogs: true,
//       },
//     });

//     if (!user) {
//       return c.json({ error: "ユーザーが見つかりません" }, 404);
//     }


//     const prompt = `
//     あなたは植物を育成するゲームのキャラクターです。
//     「こんにちは！」というような挨拶と共にプレイヤーにこれから植物を一緒に育てるようになるよう、促してください。
//     なるべく短い文章で
//     `;

//     const responseFirst = await modelFlower.generateContent(promptFlower);

    

//     console.log("responseFlower", responseFlower);
//     const responseTextFlower =
//       responseFlower.response?.candidates?.[0].content?.parts?.[0]?.text
//         ?.replace(/```json\n?/, "")
//         .replace(/\n?```/, "")
//         .trim();
//     console.log("responseTextFlower", responseTextFlower);


// })


app.post("/chat/chat", checkJWT(), async (c) => {
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

    性格はツンデレか甘えん坊などランダムです。
 
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

app.get("/chat/getChatHistory", checkJWT(), async (c) => {
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

app.get("/chat/getChatHistory", checkJWT(), async (c) => {
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


app.get("/water/getwaterlog", checkJWT(), async (c) => {
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

  const nowYear = 2025;
  const month = 5;
  const date = 4;
  const water = 88;

  const SaveData = new Date(nowYear, month - 1, date + 1);


  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }

  console.log("allData?.plants[0].id", user?.plants[0].id);


  await prisma.waterLog.create({
    data: {
      userId: user.id,
      wateredAt:SaveData,
      plantId:user?.plants[0].id
    },
  });



  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }
return c.json({
    water:water,
    wateredAt:SaveData,
  });

});


app.post("/end/post", checkJWT(), async (c) => {

  const userToken = c.get("user");
  const { plantId,event } = await c.req.json();

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



    


})

export default { 
  port: 3000, 
  fetch: app.fetch, 
} 