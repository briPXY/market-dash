import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import path from 'node:path';
import { fileURLToPath } from 'node:url';
 
let PORT = 3000; // Default local port
let HOST = '0.0.0.0'; // Allow external access

try {
    // eslint-disable-next-line no-undef
    const config = require("platformsh-config").config();
    PORT = config.port; // Use Platform.sh assigned port
} catch (err) {
    console.log("Platform.sh config not found. Running in LOCAL MODE. \n", err.toString().slice(0,0));
}

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
fastify.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
        fastify.log.error(err); 
    }
    console.log(`Fastify server running at ${address}`);
});
