
import { Hono } from 'hono'
import authRouter from './auth'
import postRouter from './post'
import chatRouter from './chat'
import calenderRouter from './calender'
import { cors } from 'hono/cors'

const app = new Hono();

const PORT = process.env.PORT || 3003; // 環境変数からポートを取得（デフォルト3003）
const API_URL = process.env.API_URL || "http://localhost:3003";

app.use(
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET,POST,PUT,PATCH,DELETE,OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization","x-auth-token"]
  })
);


app.get('/', (c) => {
  return c.text(`Hello Hono! ${API_URL}`)
})

// //authというパスを書くことでauthでwebapiを構築することができる
// //ファイル分け
app.route("/auth", authRouter);
app.route("/post", postRouter);
app.route("/chat", chatRouter);
app.route("/calendar", calenderRouter);

export default app

