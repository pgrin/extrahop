# ExtraHop Reverse Proxy Project

This is a reverse proxy with protection against Brute Force, SQL Injection and XSS
Requests are logged to proxy.log

## 🚀 Prerequisites

- Node.js v20.12.2
- Yarn
- Docker
- Hurl (for testing)

---

## 📦 Install Dependencies

```bash
yarn install
yarn build
```

## Build

```bash
yarn build
```

## Start proxy and server

To run backend server:

```bash
yarn backend
```

To run proxy server:

```bash
yarn proxy
```

To run both backend and proxy server:

```bash
yarn start
```

## Build Docker Image

```bash
docker build -t my-extrahop-app .
```

## Start on Docker

```bash
docker run -p 3000:3000 my-extrahop-app
```

## Testing

Install HURL - https://hurl.dev/docs/installation.html

```bash
hurl basic.hurl -i --error-format long
```
