import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import reqOHLC from "./src/backend/historyIO.js";

// Enable CORS so the frontend can talk to this backend
fastify.register(import("@fastify/cors"), {
    origin: "*"
});

await fastify.register(reqOHLC);
 
// Start the proxy server
fastify.listen({ port: 3001 }, () => console.log("Proxy running on http://localhost:3001"));
