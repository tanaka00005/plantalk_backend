
import { Hono } from 'hono'
import authRouter from './auth'
import postRouter from './post'
import chatRouter from './chat'
import calenderRouter from './calender'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

export const config = {
  runtime: 'edge'
}


const app = new Hono();


app.use(
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET,POST,PUT,PATCH,DELETE,OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization","x-auth-token"]
  })
);

//ファイル分け
app.route("/auth", authRouter);
app.route("/post", postRouter);
app.route("/chat", chatRouter);
app.route("/calendar", calenderRouter);

export default handle(app)

