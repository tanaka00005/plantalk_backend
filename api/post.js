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
var date_fns_1 = require("date-fns");
var postRouter = new hono_1.Hono();
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
var prisma = new client_1.PrismaClient();
postRouter.get("/private", (0, checkJWT_1.default)(), function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userToken, user, model, species, sunlight, water, temperature, humidity, character, res, prompt_1, response, responseText, today, todayFormat, modelFlower, promptFlower, responseFlower, responseTextFlower, responseJson, error_1;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                _o.trys.push([0, 4, , 5]);
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
                user = _o.sent();
                console.log("getUser", user);
                console.log("user.id", user === null || user === void 0 ? void 0 : user.id);
                model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                species = "ラディッシュ";
                sunlight = 100;
                water = 100;
                temperature = 20;
                humidity = 50;
                character = "モスモス";
                res = "";
                prompt_1 = "\n    \u690D\u7269\u306E\u72B6\u614B\u30921\u884C\u3067\u558B\u3063\u3066\u304F\u3060\u3055\u3044\u3002\n    \u690D\u7269\u306E\u7A2E\u985E\u306F".concat(species, "\u3067\u3059\u3002\n    \u65E5\u5149\u306F").concat(sunlight, "\u3067\u3059\u3002\n    \u6C34\u5206\u306F").concat(water, "\u3067\u3059\u3002\n    \u6E29\u5EA6\u306F").concat(temperature, "\u3067\u3059\u3002\n    \u6E7F\u5EA6\u306F").concat(humidity, "\u3067\u3059\u3002\n\n    \u3067\u306F\u6B21\u306E\u5F62\u5F0F\u3067\u8FD4\u7B54\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n    {\n      \"message\": \"\u690D\u7269\u306E\u72B6\u614B\u30921\u884C\u3067\u558B\u3063\u3066\u304F\u3060\u3055\u3044\u3002\"\n    }\n\n    ");
                return [4 /*yield*/, model.generateContent(prompt_1)];
            case 2:
                response = _o.sent();
                console.log("response", response);
                responseText = (_f = (_e = (_d = (_c = (_b = (_a = response.response) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0].content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) === null || _f === void 0 ? void 0 : _f.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
                console.log("responseText", responseText);
                today = new Date();
                console.log("today", today);
                todayFormat = (0, date_fns_1.format)(today, "yyyy-MM-dd");
                console.log("todayFormat", todayFormat);
                modelFlower = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                promptFlower = "\n    \u3042\u306A\u305F\u306F\u30B2\u30FC\u30E0\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u3067\u3059\u3002\u53EF\u611B\u304F".concat(todayFormat, "\u306E\u8A95\u751F\u82B1\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002\n\n\n    ");
                return [4 /*yield*/, modelFlower.generateContent(promptFlower)];
            case 3:
                responseFlower = _o.sent();
                console.log("responseFlower", responseFlower);
                responseTextFlower = (_m = (_l = (_k = (_j = (_h = (_g = responseFlower.response) === null || _g === void 0 ? void 0 : _g.candidates) === null || _h === void 0 ? void 0 : _h[0].content) === null || _j === void 0 ? void 0 : _j.parts) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.text) === null || _m === void 0 ? void 0 : _m.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
                console.log("responseTextFlower", responseTextFlower);
                if (responseText) {
                    responseJson = JSON.parse(responseText);
                    return [2 /*return*/, c.json({ message: "認証が成功しました", user: user, responseJson: responseJson, responseTextFlower: responseTextFlower })];
                }
                else {
                    return [2 /*return*/, c.json({ error: "メッセージが見つかりませんでした" }, 500)];
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _o.sent();
                return [2 /*return*/, c.json({ error: "Internal Server Error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = postRouter;
