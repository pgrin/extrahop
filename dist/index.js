"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const rate_tracker_1 = require("./rate-tracker");
const sql_injection_1 = require("./sql-injection");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const PORT = 3000;
const backendServerUrl = "http://localhost:3001";
app.use(body_parser_1.default.raw({
    type: "*/*", // Capture all request types
    limit: "1mb", // Set appropriate limit
}));
app.use((0, cookie_parser_1.default)());
app.use("/", sqliCheckMiddleware);
app.use("/login", bruteForceCheckMiddleware);
app.use("/api/login", bruteForceCheckMiddleware);
app.use((0, http_proxy_middleware_1.createProxyMiddleware)({
    target: backendServerUrl,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            // Forward the raw body
            if (req.rawBody) {
                proxyReq.setHeader("Content-Length", Buffer.byteLength(req.rawBody).toString());
                proxyReq.write(req.rawBody);
            }
            console.log("Proxy request headers:", req.headers);
        },
        proxyRes: (proxyRes, req, res) => {
            console.log(`Proxying response: ${proxyRes.statusCode}`);
        },
    },
}));
app.listen(PORT, () => {
    console.log(`Reverse proxy running at http://localhost:${PORT}`);
});
function sqliCheckMiddleware(req, res, next) {
    const { url, headers, body, query, cookies } = req;
    const rawBody = req.body ? req.body.toString() : null;
    // Manually set the body to forward later
    if (rawBody)
        req.rawBody = rawBody;
    // Flatten all request inputs into a single array of strings to inspect
    const inputs = [
        url,
        ...Object.values(query).map(String),
        ...Object.values(headers).map(String),
        ...Object.values(cookies || {}).map(String),
        rawBody,
    ];
    for (const input of inputs) {
        if ((0, sql_injection_1.isPotentialSQLi)(input)) {
            req.headers["X-Potential-SQLi"] = "true";
            req.headers["X-Malicious-Activity"] = "true";
            break;
        }
    }
    next();
}
function bruteForceCheckMiddleware(req, res, next) {
    const ip = req.ip || "unknown";
    // 5 requests per minute
    const maxRequests = 5;
    // 1 minute window
    const windowMs = 60 * 1000;
    const attempts = (0, rate_tracker_1.trackLoginAttempts)(ip, windowMs);
    req.headers["X-RateLimit-Limit"] = maxRequests.toString();
    req.headers["X-RateLimit-Remaining"] = (maxRequests - attempts > 0 ? maxRequests - attempts : 0).toString();
    if (attempts > maxRequests) {
        req.headers["X-RateLimit-Flagged"] = "true";
        req.headers["X-Malicious-Activity"] = "true";
    }
    next();
}
