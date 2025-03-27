import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Convert __dirname to work with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import reqOHLC from "./src/backend/historyIO.js";

// Enable CORS so the frontend can talk to this backend
fastify.register(await import("@fastify/cors"), {
    origin: "*"
});

await fastify.register(reqOHLC);

fastify.register(await import('@fastify/static'), {
    root: path.join(__dirname, 'dist'),
});

fastify.get('/', function (req, reply) {
    reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
})


// Start the proxy server
fastify.listen({ port: 3001 }, () => console.log("Proxy running on http://localhost:3000"));
