import dotenv from "dotenv";
dotenv.config();
import tokenList from '../data/tokenList.json' with { type: 'json' };
import { subgraphHistoricalPriceQuery, subgraphTradeHistoryQuery } from "../services/subgraph.query.js";

const Subgraphs = {}

// Order: token0/token1
Subgraphs["uniswap:1"] = {
    id: "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    list: tokenList.UniswapV3,
    queryOHLC: subgraphHistoricalPriceQuery,
    RPC: [
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
        "https://ethereum.publicnode.com",
        "https://cloudflare-eth.com"],
    info: await import('../data/UniswapV3.poolinfo.json', {
        with: { type: 'json' }
    }).then(mod => mod.default),
    trades: subgraphTradeHistoryQuery,
}

Subgraphs["uniswap:11155111"] = {
    id: "EDJCBpDBGBajTP1x3qLGLg3ZaVR5Q2TkNxyNHdCuryex",
    list: tokenList.UniswapV3Sepolia,
    queryOHLC: subgraphHistoricalPriceQuery,
    RPC: [process.env.SEPOLIA_RPC, "https://ethereum-sepolia-rpc.publicnode.com"],
    info: await import('../data/UniswapV3Sepolia.poolinfo.json', {
        with: { type: 'json' }
    }).then(mod => mod.default),
    trades: subgraphTradeHistoryQuery,
}

export default Subgraphs;
