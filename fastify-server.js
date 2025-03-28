import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import dotenv from "dotenv";
dotenv.config();

import platformshConfig from 'platformsh-config';

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

import reqOHLC from "./src/backend/historyIO.js";
await fastify.register(reqOHLC);

// eslint-disable-next-line no-undef
const PORT = process.env.LOCAL_DEV ? 3000 : platformshConfig.config().port;
const HOST = '0.0.0.0'; // Ensure external access

// eslint-disable-next-line no-undef
console.log('\x1b[36m%s\x1b[0m', `Starting server on port ${PORT} (Local: ${!!process.env.LOCAL_DEV})`);

fastify.get('/', function (req, reply) {
    reply.header('Cache-Control', 'public, max-age=300');
    reply.sendFile('index.html') 
})


// Start the proxy server
fastify.listen({ port: PORT, host: HOST }, (err) => {
    if (err) {
        fastify.log.error(err);
    }
});
