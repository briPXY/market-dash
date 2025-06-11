import { queryRespData } from "./uniswapQuery.js";

export default async function reqOHLC(fastify) {
    fastify.get("/uniswap/ohlc/:symbolIn/:symbolOut/:timeFrame", async (request, reply) => {
        try {
            
            const { symbolIn, symbolOut, timeFrame } = request.params; 
    
            // Construct the key the same way it was stored
            const pairString = `${symbolOut.toUpperCase()}-${symbolIn.toUpperCase()}`;
    
            // Check if data exists
            if (!queryRespData[timeFrame][pairString]) {
                console.error("Data not found for:", timeFrame, pairString);
                console.error("object:", Object.keys(queryRespData[timeFrame]));
                return reply.status(404).send({
                    success: false,
                    message: "Data not found",
                });
            }
            reply.header('Cache-Control', 'public, max-age=900'); 
 
            return reply.send({
                success: true,
                data: queryRespData[timeFrame][pairString],
            });
 
        }
        catch (error) {
            console.error(error);
            reply.status(400).send({ success: false, message: error.message, });
        }
    });
}