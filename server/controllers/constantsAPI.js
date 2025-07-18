import Subgraphs from "../constants/subgraph.adapter.js";

export default async function constantsAPI(fastify) {
    fastify.get("/api/pooladdress/:network", async (request, reply) => {
        try {
            const { network } = request.params; 

            reply.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

            return reply.send({
                success: true,
                data: Subgraphs[network].pools,
            });

        } catch (error) {
            console.error(error);
            reply.status(400).send({ success: false, message: error.message });
        }
    });
}