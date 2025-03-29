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
var hono_1 = require("hono");
var checkJWT_1 = require("../middleware/checkJWT");
var client_1 = require("@prisma/client");
var generative_ai_1 = require("@google/generative-ai");
var chatRouter = new hono_1.Hono();
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
var prisma = new client_1.PrismaClient();
chatRouter.post("/chat", (0, checkJWT_1.default)(), function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var model, userToken, message, chatHistoryAllData, chatHistory, user, chat, species, sunlight, water, temperature, humidity, character, prompt_1, msgWithPrompt, result, response, text, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                userToken = c.get("user");
                return [4 /*yield*/, c.req.json()];
            case 1:
                message = (_a.sent()).message;
                return [4 /*yield*/, prisma.chatLog.findMany()];
            case 2:
                chatHistoryAllData = _a.sent();
                chatHistory = chatHistoryAllData.map(function (log) {
                    return {
                        role: log.sender,
                        parts: [{ text: log.message }],
                    };
                });
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
            case 3:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, c.json({ error: "ユーザーが見つかりません" }, 404)];
                }
                if (!message) {
                    return [2 /*return*/, c.json({ error: "メッセージが空です" }, 400)];
                }
                return [4 /*yield*/, prisma.chatLog.create({
                        data: {
                            userId: user.id,
                            message: message,
                            sender: "user",
                        },
                    })];
            case 4:
                _a.sent();
                chat = model.startChat({
                    history: chatHistory,
                });
                species = "ラディッシュ";
                sunlight = 100;
                water = 100;
                temperature = 20;
                humidity = 50;
                character = "モスモス";
                prompt_1 = "\n    \u3042\u306A\u305F\u306F\u690D\u7269\u3092\u80B2\u6210\u3059\u308B\u30B2\u30FC\u30E0\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u3067\u3059\u3002\n    \u540D\u524D\u306F\u300C".concat(character, "\u300D\u3068\u3044\u3046\u690D\u7269\u306E\u5996\u7CBE\u3067\u3059\u3002\n    \u690D\u7269\u306E\u7A2E\u985E\u306F\u300C").concat(species, "\u300D\u3067\u3059\u3002\n \n    \u30E6\u30FC\u30B6\u30FC\u304B\u3089\u9001\u3089\u308C\u3066\u304F\u308B\u30E1\u30C3\u30BB\u30FC\u30B8\u306F").concat(message, "\u3067\u3059\u3002\n    \u30E6\u30FC\u30B6\u30FC\u3068\u4F1A\u8A71\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    \u3042\u307E\u308A\u9577\u6587\u3067\u306F\u8FD4\u7B54\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002\n    ");
                msgWithPrompt = "".concat(prompt_1, "\n").concat(message);
                return [4 /*yield*/, chat.sendMessage(msgWithPrompt)];
            case 5:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 6:
                response = _a.sent();
                text = response.text();
                //role: "model" → AIの返答であることを示す //parts: [{ text }] → 実際のレスポンス (text) を parts の配列に入れる
                return [4 /*yield*/, prisma.chatLog.create({
                        data: {
                            userId: user.id,
                            message: text,
                            sender: "model",
                        },
                    })];
            case 7:
                //role: "model" → AIの返答であることを示す //parts: [{ text }] → 実際のレスポンス (text) を parts の配列に入れる
                _a.sent();
                return [2 /*return*/, c.json({ text: text })];
            case 8:
                error_1 = _a.sent();
                console.error("Error:", error_1);
                return [2 /*return*/, c.json({ error: "An error occurred" }, 500)];
            case 9: return [2 /*return*/];
        }
    });
}); });
chatRouter.get("/getChatHistory", (0, checkJWT_1.default)(), function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userToken, user, chatHistoryModel, chatHistoryUser;
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
                if (!user) {
                    return [2 /*return*/, c.json({ error: "ユーザーが見つかりません" }, 404)];
                }
                return [4 /*yield*/, prisma.chatLog.findMany({
                        where: {
                            sender: "model",
                            userId: user.id,
                        },
                    })];
            case 2:
                chatHistoryModel = _a.sent();
                return [4 /*yield*/, prisma.chatLog.findMany({
                        where: {
                            sender: "user",
                            userId: user.id,
                        },
                    })];
            case 3:
                chatHistoryUser = _a.sent();
                //チャット履歴を取得
                return [2 /*return*/, c.json({
                        chatHistoryModel: chatHistoryModel,
                        chatHistoryUser: chatHistoryUser,
                    })];
        }
    });
}); });
exports.default = chatRouter;
