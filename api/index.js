"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var auth_1 = require("./auth");
var post_1 = require("./post");
var chat_1 = require("./chat");
var calender_1 = require("./calender");
var cors_1 = require("hono/cors");
var app = new hono_1.Hono();
app.use((0, cors_1.cors)({
    origin: "http://localhost:5174",
    allowMethods: ["GET,POST,PUT,PATCH,DELETE,OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));
//ファイル分け
app.route("/auth", auth_1.default);
app.route("/post", post_1.default);
app.route("/chat", chat_1.default);
app.route("/calendar", calender_1.default);
exports.default = app;
