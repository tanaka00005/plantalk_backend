import { Context, Next } from "hono";
import * as jsonwebtoken from "jsonwebtoken";

interface UserPayload {
  email: string;
  id: string;
  name:string;
}

const checkJWT = () => {
  //jwtをもっているか確認->リクエストヘッダの中のx-auth-tokenを確認
  return async (c: Context, next: Next) => {
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
  };
};

export default checkJWT;
