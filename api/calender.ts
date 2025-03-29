import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import checkJWT from "../middleware/checkJWT";

interface PostProps {
  user: {
    email: string;
    name: string;
    id: string;
  };
}

const calenderRouter = new Hono<{ Variables: PostProps }>();
const prisma = new PrismaClient();

calenderRouter.post("/", checkJWT(), async (c) => {
  const { date, month, event , diary} = await c.req.json();
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
        content:event.diary
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

calenderRouter.get("/getCalendar", checkJWT(), async (c) => {
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
    console.log("SaveData", SaveData, );
  });
  console.log("eventHistory", typeof eventHistory);

  return c.json({ eventHistory });
});
export default calenderRouter;
