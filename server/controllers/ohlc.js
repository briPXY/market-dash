import { historicalData } from "../memory/prices.memory.js";

export default async function ohlc(fastify) {
    fastify.get("/historical/:network/:symbolIn/:symbolOut/:timeFrame", async (request, reply) => {
        try {

            const { network, symbolIn, symbolOut, timeFrame } = request.params;

            // Construct the key the same way it was stored
            const pairString = `${symbolOut.toUpperCase()}-${symbolIn.toUpperCase()}`;

            // Check if data exists
            if (!historicalData[network][timeFrame][pairString]) {
                return reply.status(404).send({
                    success: false,
                    message: "Data not found",
                });
            }
            reply.header('Cache-Control', 'public, max-age=900');

            return reply.send({
                success: true,
                data: historicalData[network][timeFrame][pairString],
            });

        }
        catch (error) {
            reply.status(400).send({ success: false, message: error.message, });
        }
    });
}