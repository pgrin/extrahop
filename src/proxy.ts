import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { trackLoginAttempts as trackAttempts } from "./rate-tracker";
import { isPotentialSQLi } from "./sql-injection";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import fs from "fs";
import path from "path";
import { isPotentialXSS } from "./xss";

const app = express();
const PORT = 3000;
const backendServerUrl = "http://localhost:3001";
const logFilePath = path.join(__dirname, "../proxy.log");

// Open a write stream in append mode
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// app.use(express.urlencoded({ extended: true }));
// parse raw body up to 1mb
app.use(
  bodyParser.text({
    type: "*/*",
    limit: "1mb",
  })
);

// log the request on finish
app.use(function (req, res, next) {
  res.on("finish", () => logRequest(req, res));
  next();
});

// parse cookies
app.use(cookieParser());

// check for sql injection
app.use("/", sqliCheck);

// check for xss
app.use("/", xssCheck);

// check for brute force attack on login
app.use("/login", bruteForceCheck);
app.use("/api/login", bruteForceCheck);

// proxy requests to the backend server
app.use(
  createProxyMiddleware({
    target: backendServerUrl,
    changeOrigin: true, // changes the origin of the host header to the target URL
    on: {
      proxyReq: (proxyReq, req, res) => {
        // if body exists forward it to the backend server
        if (req.body) proxyReq.write(req.body);

        console.log("[PROXY] request headers:", req.headers);
      },
      error: (err, req, res) => {
        console.error("Proxy error:", err);
      },
    },
  })
);

// start the server
const server = app.listen(PORT, () => {
  console.log(`Reverse proxy running at http://localhost:${PORT}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// graceful shutdown
function shutdown() {
  console.log("Shutting down..");

  server.close(() => {
    console.log("Proxy server closed.");
    logStream.end(() => {
      console.log("Log file closed.");
      process.exit(0);
    });
  });
}

// check for sql injection in the query, headers, body, and cookies, flag if found
function sqliCheck(req: Request, res: Response, next: NextFunction) {
  const { url, headers, body, query, cookies } = req;

  const inputs: string[] = [
    url,
    ...Object.values(query || {}).map(String),
    ...Object.values(headers || {}).map(String),
    ...Object.values(cookies || {}).map(String),
    body || "",
  ];

  for (const input of inputs) {
    if (isPotentialSQLi(input)) {
      req.headers["X-Potential-SQLi"] = "true";
      req.headers["X-Malicious-Activity"] = "true";
      break;
    }
  }

  next();
}

// check for brute force attack, flag if too many requests
function bruteForceCheck(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";

  const maxRequests = 5;
  const windowMs = 60 * 1000;

  const attempts = trackAttempts(ip, windowMs);

  req.headers["X-RateLimit-Limit"] = maxRequests.toString();
  req.headers["X-RateLimit-Remaining"] = (
    maxRequests - attempts > 0 ? maxRequests - attempts : 0
  ).toString();

  if (attempts > maxRequests) {
    req.headers["X-RateLimit-Flagged"] = "true";
    req.headers["X-Malicious-Activity"] = "true";
  }

  next();
}

function xssCheck(req: Request, res: Response, next: NextFunction) {
  if (
    isPotentialXSS(decodeURIComponent(req.body)) ||
    isPotentialXSS(req.query) ||
    isPotentialXSS(req.cookies)
  ) {
    req.headers["X-Potential-XSS"] = "true";
    req.headers["X-Malicious-Activity"] = "true";
  }
  next();
}

// log the request to the log file
function logRequest(req: Request, res: Response) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    headers: req.headers,
    ip: req.ip,
  };

  logStream.write(JSON.stringify(logEntry) + "\n");
}
