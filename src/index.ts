import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { trackLoginAttempts } from "./rate-tracker";
import { isPotentialSQLi } from "./sql-injection";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const backendServerUrl = "http://localhost:3001";

app.use(
  bodyParser.raw({
    type: "*/*", // Capture all request types
    limit: "1mb", // Set appropriate limit
  })
);
app.use(cookieParser());

app.use("/", sqliCheckMiddleware);
app.use("/login", bruteForceCheckMiddleware);
app.use("/api/login", bruteForceCheckMiddleware);

app.use(
  createProxyMiddleware({
    target: backendServerUrl,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Forward the raw body
        if ((req as any).rawBody) {
          proxyReq.setHeader(
            "Content-Length",
            Buffer.byteLength((req as any).rawBody).toString()
          );
          proxyReq.write((req as any).rawBody);
        }

        console.log("Proxy request headers:", req.headers);
      },
      proxyRes: (proxyRes, req, res) => {
        console.log(`Proxying response: ${proxyRes.statusCode}`);
      },
    },
  })
);

app.listen(PORT, () => {
  console.log(`Reverse proxy running at http://localhost:${PORT}`);
});

function sqliCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  const { url, headers, body, query, cookies } = req;

  const rawBody = req.body ? req.body.toString() : null;

  // Manually set the body to forward later
  if (rawBody) (req as any).rawBody = rawBody;

  // Flatten all request inputs into a single array of strings to inspect
  const inputs: string[] = [
    url,
    ...Object.values(query).map(String),
    ...Object.values(headers).map(String),
    ...Object.values(cookies || {}).map(String),
    rawBody,
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

function bruteForceCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || "unknown";

  // 5 requests per minute
  const maxRequests = 5;
  // 1 minute window
  const windowMs = 60 * 1000;

  const attempts = trackLoginAttempts(ip, windowMs);

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
