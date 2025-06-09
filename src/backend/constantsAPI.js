import PoolAddress from './poolAddress.js';

export default async function constantsAPI(fastify) {
    fastify.get("/api/pooladdress/:pool", async (request, reply) => {
        try {
            const { pool } = request.params; 

            reply.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

            return reply.send({
                success: true,
                data: PoolAddress[pool],
            });

        } catch (error) {
            console.error(error);
            reply.status(400).send({ success: false, message: error.message });
        }
    });
}