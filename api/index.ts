
import { Hono } from 'hono'
//import authRouter from './auth'
import { handle } from 'hono/vercel'
import postRouter from './post'
import chatRouter from './chat'
import calenderRouter from './calender'
import { cors } from 'hono/cors'

export const runtime = "nodejs";

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.use(
  cors({
    origin: "http://localhost:5174",
    allowMethods: ["GET,POST,PUT,PATCH,DELETE,OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization","x-auth-token"]
  })
);



export const GET = handle(app);
export const POST = handle(app);


import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import * as jsonwebtoken from "jsonwebtoken";

const prisma = new PrismaClient();

app.get("/auth/", async (c) => {
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
  let hashedPassword = await argon2.hash(password);

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



