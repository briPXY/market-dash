import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import dotenv from "dotenv";
dotenv.config();
import path from 'node:path';
import { fileURLToPath } from 'node:url';  

// Convert __dirname to work with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fastify.register(await import('@fastify/static'), {
    root: path.join(__dirname, 'dist'),
});
fastify.register(await import("@fastify/cors"), {
    origin: "*"
});
fastify.register(await import("@fastify/websocket"));
 
// Source modules
import "./server/services/Uniswap.LivePrices.js";
import "./server/services/Uniswap.Subgraph.js";
import ohlc from "./server/controllers/ohlc.js";
import constantsAPI from "./server/controllers/constantsAPI.js";
import livePriceWebSocket from "./server/ws/LivePrices.Memory.js";

await fastify.register(ohlc);
await fastify.register(constantsAPI);
await fastify.register(livePriceWebSocket);

fastify.get('/', function (req, reply) {
    reply.header('Cache-Control', 'public, max-age=300');
    reply.sendFile('index.html')
})

fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error); // Logs full error details

    reply.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: error.message, // Show only the error message
    });
});

// ✅ Handle Uncaught JavaScript Errors (for background modules, etc.)
// eslint-disable-next-line no-undef
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
});

// eslint-disable-next-line no-undef
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
});

// eslint-disable-next-line no-undef
console.log('\x1b[36m%s\x1b[0m', `Starting server (Is local?: ${!!process.env.LOCAL_DEV})`);

// Start the proxy server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
    }
});
