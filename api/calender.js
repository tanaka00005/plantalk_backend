"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var hono_1 = require("hono");
var checkJWT_1 = require("../middleware/checkJWT");
var calenderRouter = new hono_1.Hono();
var prisma = new client_1.PrismaClient();
calenderRouter.post("/", (0, checkJWT_1.default)(), function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, date, month, event, diary, now, nowYear, userToken, SaveData, allData, eventHistory;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _b.sent(), date = _a.date, month = _a.month, event = _a.event, diary = _a.diary;
                console.log("date, month, event.emoji, event.growth, diary", date, month, event.emoji, event.growth, event.diary);
                now = new Date();
                nowYear = now.getFullYear();
                console.log("nowYear", nowYear);
                userToken = c.get("user");
                console.log("userToken", userToken);
                SaveData = new Date(nowYear, month - 1, date + 1);
                console.log("SaveData", SaveData);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: {
                            email: userToken.email,
                        },
                        include: {
                            plants: true,
                            diaries: true,
                            waterLogs: true,
                        },
                    })];
            case 2:
                allData = _b.sent();
                console.log("allData?.plants[0].id", allData === null || allData === void 0 ? void 0 : allData.plants[0].id);
                if (!allData) {
                    return [2 /*return*/, c.json({ error: "ユーザーが見つかりません" }, 404)];
                }
                return [4 /*yield*/, prisma.diary.findFirst({
                        where: {
                            recordedAt: SaveData,
                        },
                    })];
            case 3:
                eventHistory = _b.sent();
                console.log("eventHistory", eventHistory);
                if (!eventHistory) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.diary.update({
                        where: {
                            id: eventHistory.id,
                        },
                        data: {
                            healthState: event.emoji,
                            growthState: event.growth,
                            content: event.diary
                        },
                    })];
            case 4:
                _b.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, prisma.diary.create({
                    data: {
                        plantId: allData === null || allData === void 0 ? void 0 : allData.plants[0].id,
                        healthState: event.emoji,
                        recordedAt: SaveData,
                        userId: allData.id,
                        content: event.diary,
                        growthState: event.growth,
                    },
                })];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [2 /*return*/, c.json(allData)];
        }
    });
}); });
calenderRouter.get("/getCalendar", (0, checkJWT_1.default)(), function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userToken, user, eventHistory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userToken = c.get("user");
                return [4 /*yield*/, prisma.user.findUnique({
                        where: {
                            email: userToken.email,
                        },
                        include: {
                            plants: true,
                            diaries: true,
                            waterLogs: true,
                        },
                    })];
            case 1:
                user = _a.sent();
                console.log("user", user);
                if (!user) {
                    return [2 /*return*/, c.json({ error: "ユーザーが見つかりません" }, 404)];
                }
                return [4 /*yield*/, prisma.diary.findMany({
                        where: {
                            userId: user.id,
                        },
                    })];
            case 2:
                eventHistory = _a.sent();
                console.log("eventHistory", eventHistory);
                eventHistory.map(function (event) {
                    console.log(event);
                    console.log("event", event.recordedAt);
                    console.log("event", typeof event.recordedAt);
                    console.log("day", event.recordedAt.getDate() - 2);
                    console.log("month", event.recordedAt.getMonth() + 1);
                    console.log("month", event.recordedAt.getFullYear());
                    //console.log("SaveData",SaveData);
                    var SaveData = new Date(event.recordedAt.getDate() - 2, event.recordedAt.getMonth() + 1, event.recordedAt.getFullYear());
                    console.log("SaveData", SaveData);
                });
                console.log("eventHistory", typeof eventHistory);
                return [2 /*return*/, c.json({ eventHistory: eventHistory })];
        }
    });
}); });
exports.default = calenderRouter;
