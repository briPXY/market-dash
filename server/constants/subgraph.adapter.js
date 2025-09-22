import dotenv from "dotenv";
dotenv.config();
import tokenList from '../data/tokenList.json' with { type: 'json' };

const Subgraphs = {}

// Order: token0/token1
Subgraphs.UniswapV3 = {
    id: "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    list: tokenList.UniswapV3,
    RPC: [
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
        "https://ethereum.publicnode.com",
        "https://cloudflare-eth.com"],
    info: await import('../data/UniswapV3.poolinfo.json', {
        with: { type: 'json' }
    }).then(mod => mod.default),
}

Subgraphs.UniswapV3Sepolia = {
    id: "EDJCBpDBGBajTP1x3qLGLg3ZaVR5Q2TkNxyNHdCuryex",
    list: tokenList.UniswapV3Sepolia,
    RPC: [process.env.SEPOLIA_RPC, "https://ethereum-sepolia-rpc.publicnode.com"],
    info: await import('../data/UniswapV3Sepolia.poolinfo.json', {
        with: { type: 'json' }
    }).then(mod => mod.default),
}

export default Subgraphs;
