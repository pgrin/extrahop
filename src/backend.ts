import express, { Request, Response } from "express";

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ received: req.headers });
  console.log(req.headers);
});

app.post("/", (req: Request, res: Response) => {
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
