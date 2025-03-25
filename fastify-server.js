import Fastify from "fastify";
import axios from "axios";
import dotenv from "dotenv"; 
const fastify = Fastify({ logger: true });

// Enable CORS so the frontend can talk to this backend
fastify.register(import("@fastify/cors"), {
    origin: "*"
});

dotenv.config(); // Load .env variables

fastify.post("/uniswap/ohlc", async (request, reply) => {
    const { timeframe, poolAddress, count } = request.body;

    // Map frontend timeframes to Uniswap subgraph entities
    const timeframeMapping = {
        "1h": { type: "poolHourDatas", timeField: "periodStartUnix" },
        "1d": { type: "poolDayDatas", timeField: "date" }
    }; 

    if (!timeframeMapping[timeframe]) {
        return reply.code(400).send({ error: "Invalid timeframe. Use 1h or 1d." });
    }
    const { type, timeField } = timeframeMapping[timeframe];

    const query = `{
        ${type}(
            first: ${count},
            orderBy: ${timeField},
            orderDirection: desc,
            where: { pool: "${poolAddress}" }
        ) {
            ${timeField}
            open
            high
            low
            close
            volumeUSD
        }
    }`;

    try {
        const response = await axios.post(
            // eslint-disable-next-line no-undef
            process.env.SUBGRAPH_URL, // ✅ Use Uniswap Subgraph URL from .env
            { query },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ); 
 
        reply.header('Cache-Control', 'public, max-age=900');
        return reply.send(response.data.data);
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: error.message });
    }
});
 

// Start the proxy server
fastify.listen({ port: 3001 }, () => console.log("Proxy running on http://localhost:3001"));
