// import { PrismaClient } from "@prisma/client";
// import { Hono } from "hono";
// import * as argon2 from "argon2";
// import * as jsonwebtoken from "jsonwebtoken";

// const authRouter = new Hono();
// const prisma = new PrismaClient();

// authRouter.get("/", async (c) => {
//   try {
//     const auth = await prisma.user.findMany();
//     return c.json(auth);
//   } catch (error) {
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });

// authRouter.post("/register", async (c) => {
//   const getUser = await c.req.json();
//   const email = getUser.email;
//   const name = getUser.name;
//   const password = getUser.password;
//   const species = getUser.species;
//   const speciesName = getUser.speciesName;

//   if (!email) {
//     return c.json({ error: "emailを登録してください" }, 400);
//   }
//   if (!name) {
//     return c.json({ error: "名前を登録してください" }, 400);
//   }
//   if (!password) {
//     return c.json({ error: "パスワードを登録してください" }, 400);
//   }

//   //prismaschemaからuserを取得、getUser.emailで得たemailと一致したらtrue
//   const user = await prisma.user.findUnique({
//     where: { email: email },
//   });

//   if (user) {
//     return c.json({ error: "すでにそのユーザーは存在しています" }, 400);
//   }

//   //パスワードの暗号化
//   //saltRoundsは大体10
//   let hashedPassword = await argon2.hash(password);

//   //dbへ保存
//   await prisma.user.create({
//     data: {
//       name: name,
//       email: email,
//       password: hashedPassword,
//       plants: {
//         create: {
//           species: species,
//           speciesName: speciesName,
//         },
//       },
//     },
//   });
//   //   return c.json(createUser);

//   //"SECRET_KEY"をもとに加工
//   //クライアントへのjsonwebtokenの発行
//   const token = await jsonwebtoken.sign(
//     {
//       email,
//     },
//     "SECRET_KEY", //.envに
//     {
//       expiresIn: "24h",
//     }
//   );
//   return c.json({
//     token: token,
//   });
// });

// authRouter.post("/login", async (c) => {
//   const { email, name, password } = await c.req.json();


//   const user = await prisma.user.findFirst({
//     where: { AND: [{ email: email }, { name: name }] },
//   });

//   if (!user) {
//     return c.text("そのユーザーは存在しません");
//   }

//   //パスワードの復号、照合
//   //compareで復号
//   const isMatch = await argon2.verify(user.password, password);

//   if (!isMatch) {
//     return c.json({ error: "パスワードが異なります" }, 400);
//   }

//   //"SECRET_KEY"をもとに加工
//   const token = await jsonwebtoken.sign(
//     {
//       email,
//     },
//     "SECRET_KEY",
//     {
//       expiresIn: "24h",
//     }
//   );
//   return c.json({
//     token: token,
//   });
// });

// export default authRouter;
