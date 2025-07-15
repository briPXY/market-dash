import LivePrice, { LivePriceListener } from "../memory/livePrice.js";

export default async function livePriceWebSocket(fastify) {
    // WebSocket endpoint
    fastify.get('/liveprice/:provider/:symbols', { websocket: true }, (socket, req) => {

        const { provider, symbols } = req.params;
        const topic = `priceUpdate:${provider}:${symbols}`;
        const initialPrice = LivePrice[provider]?.[symbols];

        if (initialPrice === undefined) {
            socket.send(JSON.stringify({ error: 'Invalid provider or symbol' }));
            socket.close();
            return;
        }

        // Listener for real-time updates
        const listener = (update) => {
            try {
                socket.send(JSON.stringify(update));
            } catch (err) {
                req.log.error('Failed to send update:', err);
            }
        }; 

        // Send the initial price immediately
        socket.send(JSON.stringify({
            provider,
            symbol: symbols,
            p: initialPrice,
            timestamp: new Date().toISOString()
        }));

        LivePriceListener.on(topic, listener);

        // Clean up when client disconnects
        socket.on('close', () => {
            LivePriceListener.off(topic, listener); // console.log('WebSocket -------------- connection closed'); 
        });
        socket.on('error', (e) => {
            LivePriceListener.off(topic, listener);
            console.error('ws error ------ ', e);
        });

    });

    // Whole object req
    fastify.get('/bulkprice/:provider', (req, reply) => {
        const { provider } = req.params;

        reply.header('Cache-Control', 'public, max-age=5');

        if (!LivePrice[provider]) {
            reply.status(404).send({ success: false, message: "provider not found", });
            return;
        }

        return reply.send({
            success: true,
            data: LivePrice[provider],
        });
    });

}