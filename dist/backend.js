"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3001;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({ received: req.headers });
    console.log(req.headers);
});
app.post("/", (req, res) => {
    res.json({ received: req.body });
    console.log("url", req.url, "body", req.body, "headers", req.headers);
});
app.put("/", (req, res) => {
    res.json({ received: req.body });
    console.log("url", req.url, "body", req.body, "headers", req.headers);
});
app.get("/login", (req, res) => {
    res.json({ received: req.headers });
    console.log(req.headers);
});
app.post("/login", (req, res) => {
    res.json({ received: req.body });
    console.log("url", req.url, "body", req.body, "headers", req.headers);
});
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
