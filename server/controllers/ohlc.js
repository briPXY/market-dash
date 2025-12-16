import axios from "axios";
import dns from 'dns';
import Subgraphs from "../constants/subgraph.adapter.js";

const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '1.0.0.1']); // cloudflare DNS

const schemaWithAPIKey = {
    headers: {
        type: 'object',
        properties: {
            'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
    }
};

function resolveBinanceIP(resolver) {
    return new Promise((resolve, reject) => {
        resolver.resolve4('api.binance.com', (err, addresses) => {
            if (err) return reject(err);
            resolve(addresses);
        });
    });
}


export default async function ohlc(fastify) {
    fastify.get("/api/v1/his/:time/:addressTraderChainId", schemaWithAPIKey, async (request, reply) => {
        try {
            const { time, addressTraderChainId } = request.params;
            const { 'x-api-key': apiKey } = request.headers;
            const [address, traderChainId] = addressTraderChainId.split('@');

            const ohlcData = await Subgraphs[traderChainId].queryOHLC(address, time, apiKey, Subgraphs[traderChainId].id);

            reply.header('Cache-Control', 'public, max-age=600'); // 10 minutes

            return reply.send({
                success: true,
                data: ohlcData,
            });

        }
        catch (error) {
            reply.status(400).send({ success: false, message: error.message, });
        }
    });

    fastify.get('/api/v1/t/:symbolsPlatform', async (request, reply) => {
        const { symbolsPlatform } = request.params;
        // eslint-disable-next-line no-unused-vars
        const [symbols, platform] = symbolsPlatform.split('@');

        try {
            // rsolve binance IP using coudflare DNS
            const addresses = await resolveBinanceIP(resolver);
            const binanceIp = addresses[0];

            // force axios to connect directly to that IP, but still send Host header
            const response = await axios.get(`https://${binanceIp}/api/v3/ticker/price`, {
                params: { symbols },
                headers: { Host: 'api.binance.com' }, // critical for TLS SNI
            });

            reply.header('Access-Control-Allow-Origin', '*');
            reply.send(response.data);
        } catch (err) {
            request.log.error(err);
            if (err.response) {
                reply.code(err.response.status).send({
                    error: `live price API error: ${err.response.statusText}`,
                    details: err.response.data,
                });
            } else {
                reply.code(500).send({
                    error: 'Failed to fetch price from liveprice node',
                    details: err.message,
                    symbol: symbols,
                });
            }
        }
    });



}