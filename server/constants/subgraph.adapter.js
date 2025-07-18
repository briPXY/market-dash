import dotenv from "dotenv";
dotenv.config();

const Subgraphs = {}

Subgraphs.UniswapV3 = {
    id: "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    pools: { // order = token1-token0 (symbolOut - In)
        "USDT-WETH": "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36",
        "USDT-WBTC": "0x9db9e0e53058c89e5b94e29621a205198648425b",
        "USDC-WBTC": "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35",
        "WETH-WBTC": "0x4585fe77225b41b697c938b018e2ac67ac5a20c0",
        "WETH-LINK": "0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8",
        "BERASTONE-WETH": "0x6dcba3657ee750a51a13a235b4ed081317da3066",
        "USDM-HKDM": "0x5796d7ad51583ae2c7297652edb7006bcd90519d",
        "WETH-UNI": "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801",
        "WETH-MKR": "0xe8c6c9227491c0a8156a0106a0204d881bb7e531",
    },
    RPC: "https://eth.llamarpc.com",
}

Subgraphs.UniswapV3Sepolia = {
    id: "0x3289680dd4d6c10bb19b899729cda5eef58aeff1",
    pools: {
        "WETH-YBTC": "0xc4545a0b4a87cbaff03a73f45c377c0b5f416e00",
        "YU-YBTC": "0xc0b6f0c5d4c33c59b4672000d490992b7097ba40",
        "tBTC-WETH": "0xa9df6536d606241e2708b3b6da63dd7163fb734d",
        "WETH-YU": "0x91bee36974282b9335f694035ca047309ea0b026",
        "WETH-MON": "0xfac1138c5a426d26a6e350868eee6501788f1417",
        "WETH-USDC": "0x3289680dd4d6c10bb19b899729cda5eef58aeff1",
        "WETH-UNI": "0x287b0e934ed0439e2a7b1d5f0fc25ea2c24b64f7",
        "WETH-FDT": "0x634e1e35616f4b3ed8d3459e430900209ea7ca20",
        "WETH-USDT": "0x58d850667c47981a1b6e7ca0b8dc2eb937cd4119",
        "WETH-DRAC": "0x0a6886558f9f39876e47ec6ee1a521236e757388",
        "WETH-BYT": "0xfc5fab0a82d2601fd4a1a5f11a8979c8fc95ab8a",
        "WETH-ULTI": "0xa1d509ef257220ce3bd5661d87849b83643dbea5",
    },
    RPC: process.env.SEPOLIA_RPC,
}

export default Subgraphs;
