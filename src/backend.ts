import express, { Request, Response } from "express";
import http from "http";

const app = express();
const PORT = 3001;

// // Create the HTTP server instance
// const server = http.createServer(app);

const server = app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ received: req.headers });
  console.log("[BACKEND] headers", req.headers);
});

app.post("/", (req: Request, res: Response) => {
  res.json({ received: req.body });
  console.log(
    "[BACKEND] url",
    req.url,
    "body",
    req.body,
    "headers",
    req.headers
  );
});

app.put("/", (req, res) => {
  res.json({ received: req.body });
  console.log(
    "[BACKEND] url",
    req.url,
    "body",
    req.body,
    "headers",
    req.headers
  );
});

app.get("/login", (req, res) => {
  res.json({ received: req.headers });
  console.log("[BACKEND] headers", req.headers);
});

app.post("/login", (req, res) => {
  res.json({ received: req.body });
  console.log(
    "[BACKEND] url",
    req.url,
    "body",
    req.body,
    "headers",
    req.headers
  );
});

// graceful shutdown
function shutdown() {
  console.log("Shutting down..");
  server.close(() => {
    console.log("Backend server closed.");
    process.exit(0);
  });
}
