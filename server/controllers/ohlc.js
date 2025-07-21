import { historicalData } from "../memory/prices.memory.js";

export default async function ohlc(fastify) {
    fastify.get("/historical/:network/:address/:timeFrame", async (request, reply) => {
        try {

            const { network, address, timeFrame } = request.params; 
            const dataPool = historicalData[network][timeFrame];
            
            reply.header('Cache-Control', 'public, max-age=900');

            return reply.send({
                success: true,
                data: dataPool[address],
            });

        }
        catch (error) {
            reply.status(400).send({ success: false, message: error.message, });
        }
    });
}