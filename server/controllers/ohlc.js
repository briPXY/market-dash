import { historicalData } from "../memory/prices.memory.js";

export default async function ohlc(fastify) {
    fastify.get("/historical/:network/:symbolIn/:symbolOut/:timeFrame", async (request, reply) => {
        try {

            const { network, symbolIn, symbolOut, timeFrame } = request.params;

            const dataPool = historicalData[network][timeFrame];
            const pairString = `${symbolOut.toUpperCase()}-${symbolIn.toUpperCase()}` in dataPool ? `${symbolOut.toUpperCase()}-${symbolIn.toUpperCase()}` : `${symbolIn.toUpperCase()}-${symbolOut.toUpperCase()}`;
 
            reply.header('Cache-Control', 'public, max-age=900');

            return reply.send({
                success: true,
                data: dataPool[pairString],
            });

        }
        catch (error) {
            reply.status(400).send({ success: false, message: error.message, });
        }
    });
}