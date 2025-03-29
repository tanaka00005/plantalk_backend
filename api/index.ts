
import { Hono } from 'hono'
import authRouter from './auth'
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

//ファイル分け
//app.route("/auth", authRouter);
//app.route("/post", postRouter);
//app.route("/chat", chatRouter);
//app.route("/calendar", calenderRouter);

export const GET = handle(app);
export const POST = handle(app);

