import { historicalData } from "../memory/historicalData.js";

export default async function reqOHLC(fastify) {
    fastify.get("/historical/:network/:symbolIn/:symbolOut/:timeFrame", async (request, reply) => {
        try {
            
            const { network, symbolIn, symbolOut, timeFrame } = request.params; 
    
            // Construct the key the same way it was stored
            const pairString = `${symbolOut.toUpperCase()}-${symbolIn.toUpperCase()}`;
    
            // Check if data exists
            if (!historicalData[network][timeFrame][pairString]) {
                console.error("Data not found for:", timeFrame, pairString);
                console.error("object:", Object.keys(historicalData[network][timeFrame]));
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
            console.error(error);
            reply.status(400).send({ success: false, message: error.message, });
        }
    });
}