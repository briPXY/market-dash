export const binanceHighlights = [
    {
        "symbols": "BTCUSDT",
        "token1": {
            // Note: BTC is Wrapped Bitcoin (WBTC) on Ethereum
            "decimals": "8",
            "name": "Wrapped Bitcoin",
            "symbol": "WBTC",
            "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "ETHUSDT",
        "token1": {
            // Note: ETH itself is the native coin, but is often WETH (Wrapped Ether) for pools
            "decimals": "18",
            "name": "Wrapped Ether",
            "symbol": "WETH",
            "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "BNBUSDT",
        "token1": {
            // Note: BNB on Ethereum is a bridged/wrapped ERC-20 token (usually an all-caps BNB or WBNB, using the same Binance-issued contract)
            "decimals": "18",
            "name": "Binance Coin",
            "symbol": "BNB",
            // The contract address can vary based on the bridging solution. This is one common contract for BNB on Ethereum.
            "address": "0xB8c77482e45F1F44dE1745F52C74426C631bAA52"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "XRPUSDT",
        "token1": {
            // Note: XRP on Ethereum is a wrapped/bridged token (e.g., wXRP). This is a placeholder as the canonical address can vary based on the bridge.
            "decimals": "6",
            "name": "Wrapped XRP",
            "symbol": "wXRP",
            "address": "0x1D2F17dE01e233C2f3c0519E16c52b2253816223" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "DOGEUSDT",
        "token1": {
            // Note: DOGE on Ethereum is a wrapped/bridged token (e.g., wDOGE). This is a placeholder.
            "decimals": "8",
            "name": "Wrapped Dogecoin",
            "symbol": "wDOGE",
            "address": "0xBA5C2bC684534484E4324f4e24694469a5382D4d" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "ADAUSDT",
        "token1": {
            // Note: ADA on Ethereum is a wrapped/bridged token (e.g., wADA). This is a placeholder.
            "decimals": "6",
            "name": "Wrapped Cardano",
            "symbol": "wADA",
            "address": "0x97a3aE8c6B99b11b5167b579124E5649fD04e222" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "SOLUSDT",
        "token1": {
            // Note: SOL on Ethereum is a wrapped/bridged token (e.g., wSOL). This is a placeholder.
            "decimals": "9",
            "name": "Wrapped Solana",
            "symbol": "wSOL",
            "address": "0xd31a89c3755c3c0b05b382098693c4e365D65A46" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "DOTUSDT",
        "token1": {
            // Note: DOT on Ethereum is a wrapped/bridged token (e.g., wDOT). This is a placeholder.
            "decimals": "10",
            "name": "Wrapped Polkadot",
            "symbol": "wDOT",
            "address": "0x789b9809F0854c868172c723f05354F9D46199a5" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "MATICUSDT",
        "token1": {
            // Note: MATIC is an ERC-20 token on the Ethereum Mainnet.
            "decimals": "18",
            "name": "Polygon Token",
            "symbol": "MATIC",
            "address": "0x7D1AfA7B718a9010AEB9bA488095f9C3D52bB0BE"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "LTCUSDT",
        "token1": {
            // Note: LTC on Ethereum is a wrapped/bridged token (e.g., wLTC). This is a placeholder.
            "decimals": "8",
            "name": "Wrapped Litecoin",
            "symbol": "wLTC",
            "address": "0x5d9b5e5D450702f2389d4289873d6118D602f347" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "TRXUSDT",
        "token1": {
            // Note: TRX on Ethereum is a wrapped/bridged token (e.g., wTRX). This is a placeholder.
            "decimals": "6",
            "name": "Wrapped TRON",
            "symbol": "wTRX",
            "address": "0xf266d6d74E8640726d48807F63D995779c17C5a0" // Example Placeholder
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "SHIBUSDT",
        "token1": {
            // Note: SHIB is a native ERC-20 token on the Ethereum Mainnet.
            "decimals": "18",
            "name": "Shiba Inu",
            "symbol": "SHIB",
            "address": "0x95aD61b0a150d79219dCEE49262d98a645bC254c"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "AVAXUSDT",
        "token1": {
            // Note: AVAX on Ethereum is a wrapped/bridged token (e.g., AVAX on the C-Chain is wrapped to be an ERC-20 on Ethereum). This is a placeholder.
            "decimals": "18",
            "name": "Wrapped Avalanche",
            "symbol": "WAVAX",
            "address": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" // This is the address of WAVAX on the Avalanche C-Chain, not Ethereum. The actual ERC-20 bridged token contract on Ethereum varies by bridge.
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "LINKUSDT",
        "token1": {
            // Note: LINK is a native ERC-20 token on the Ethereum Mainnet.
            "decimals": "18",
            "name": "Chainlink",
            "symbol": "LINK",
            "address": "0x514910771AF9Ca656af840dff83E8264dC6fA922"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    {
        "symbols": "ATOMUSDT",
        "token1": {
            // Note: ATOM on Ethereum is a wrapped/bridged token (e.g., wATOM). This is the common contract for ATOM as an ERC-20 on Ethereum.
            "decimals": "6",
            "name": "Cosmos Token",
            "symbol": "ATOM",
            "address": "0x8D983cb9388EaC77af0474fA441C4815500Cb7BB"
        },
        "token0": {
            "decimals": "6",
            "name": "USD Tether",
            "symbol": "USDT",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    }
]

export const uniswapV3EtherumHighlights = [
    {
        "symbols": "USDCWETH",
        "feeTier": "500",
        "address": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        "liquidity": "1174022528522869165",
        "token0": {
            "decimals": "6",
            "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "name": "USD Coin",
            "symbol": "USDC"
        },
        "token1": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        }
    },
    {
        "symbols": "WBTCWETH",
        "feeTier": "3000",
        "address": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
        "liquidity": "90957880915521831",
        "token0": {
            "decimals": "8",
            "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "name": "Wrapped BTC",
            "symbol": "WBTC"
        },
        "token1": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        }
    },
    {
        "symbols": "WETHUSDT",
        "feeTier": "3000",
        "address": "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36",
        "liquidity": "6212999787289401073",
        "token0": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "token1": {
            "decimals": "6",
            "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "name": "Tether USD",
            "symbol": "USDT"
        }
    },
    {
        "symbols": "WBTCUSDC",
        "feeTier": "3000",
        "address": "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35",
        "liquidity": "3635699735871",
        "token0": {
            "decimals": "8",
            "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "name": "Wrapped BTC",
            "symbol": "WBTC"
        },
        "token1": {
            "decimals": "6",
            "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "name": "USD Coin",
            "symbol": "USDC"
        }
    },
    {
        "symbols": "WBTCUSDT",
        "feeTier": "3000",
        "address": "0x9db9e0e53058c89e5b94e29621a205198648425b",
        "liquidity": "5986973195455",
        "token0": {
            "decimals": "8",
            "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "name": "Wrapped BTC",
            "symbol": "WBTC"
        },
        "token1": {
            "decimals": "6",
            "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "name": "Tether USD",
            "symbol": "USDT"
        }
    },
    {
        "symbols": "WETHUSDT2",
        "feeTier": "500",
        "address": "0x11b815efb8f581194ae79006d24e0d814b7697f6",
        "liquidity": "677961259135891150",
        "token0": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "token1": {
            "decimals": "6",
            "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "name": "Tether USD",
            "symbol": "USDT"
        }
    },
    {
        "symbols": "LINKWETH",
        "feeTier": "3000",
        "address": "0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8",
        "liquidity": "985413440927803134482693",
        "token0": {
            "decimals": "18",
            "address": "0x514910771af9ca656af840dff83e8264ecf986ca",
            "name": "ChainLink Token",
            "symbol": "LINK"
        },
        "token1": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        }
    },
    {
        "symbols": "DAIWETH",
        "feeTier": "3000",
        "address": "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8",
        "liquidity": "87602362200522339900117",
        "token0": {
            "decimals": "18",
            "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "name": "Dai Stablecoin",
            "symbol": "DAI"
        },
        "token1": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        }
    },
    {
        "symbols": "HKDMUSDM",
        "feeTier": "100",
        "address": "0x5796d7ad51583ae2c7297652edb7006bcd90519d",
        "liquidity": "214907032744019640",
        "token0": {
            "decimals": "6",
            "address": "0x0071f94350573cd411e40bb409e7ddd927224054",
            "name": "HKD Mapped Token",
            "symbol": "HKDM"
        },
        "token1": {
            "decimals": "6",
            "address": "0xbbaec992fc2d637151daf40451f160bf85f3c8c1",
            "name": "USD Mapped Token",
            "symbol": "USDM"
        }
    },
    {
        "symbols": "DAIUSDC",
        "feeTier": "100",
        "address": "0x5777d92f208679db4b9778590fa3cab3ac9e2168",
        "liquidity": "228971636403085695768182",
        "token0": {
            "decimals": "18",
            "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "name": "Dai Stablecoin",
            "symbol": "DAI"
        },
        "token1": {
            "decimals": "6",
            "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "name": "USD Coin",
            "symbol": "USDC"
        }
    },
    {
        "symbols": "UNIWETH",
        "feeTier": "3000",
        "address": "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801",
        "liquidity": "71356745470601192883059",
        "token0": {
            "decimals": "18",
            "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "name": "Uniswap",
            "symbol": "UNI"
        },
        "token1": {
            "decimals": "18",
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        }
    }
];

export const uniswapV3SepoilaStarterPairs = [
    {
        "feeTier": "500",
        "id": "0x0a6886558f9f39876e47ec6ee1a521236e757388",
        "token0": {
            "decimals": "18",
            "id": "0x634e1e79fad6fabfa17600fedc25d8dac22cf5eb",
            "name": "Vampire Lord",
            "symbol": "DRAC"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "10213",
        "symbols": "DRACWETH"
    },
    {
        "feeTier": "3000",
        "id": "0x287b0e934ed0439e2a7b1d5f0fc25ea2c24b64f7",
        "token0": {
            "decimals": "18",
            "id": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "name": "Uniswap",
            "symbol": "UNI"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "140070",
        "symbols": "UNIWETH"
    },
    {
        "feeTier": "500",
        "id": "0x3289680dd4d6c10bb19b899729cda5eef58aeff1",
        "token0": {
            "decimals": "6",
            "id": "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
            "name": "USDC",
            "symbol": "USDC"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "186102",
        "symbols": "USDCWETH"
    },
    {
        "feeTier": "10000",
        "id": "0x58d850667c47981a1b6e7ca0b8dc2eb937cd4119",
        "token0": {
            "decimals": "6",
            "id": "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
            "name": "USDT",
            "symbol": "USDT"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "16065",
        "symbols": "USDTWETH"
    },
    {
        "feeTier": "10000",
        "id": "0x634e1e35616f4b3ed8d3459e430900209ea7ca20",
        "token0": {
            "decimals": "6",
            "id": "0x9a32e1383e7fd24a6d9c5db181457125a8d511c2",
            "name": "faucet dao token",
            "symbol": "FDT"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "2057",
        "symbols": "FDTWETH"
    },
    {
        "feeTier": "10000",
        "id": "0x91bee36974282b9335f694035ca047309ea0b026",
        "token0": {
            "decimals": "18",
            "id": "0xe0232d625ea3b94698f0a7dff702931b704083c9",
            "name": "Yala Stable Coin",
            "symbol": "YU"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "21295",
        "symbols": "YUWETH"
    },
    {
        "feeTier": "10000",
        "id": "0xa1d509ef257220ce3bd5661d87849b83643dbea5",
        "token0": {
            "decimals": "18",
            "id": "0x8137ee754f6c5c3cb66e9dd029b6d60c17f057f3",
            "name": "ULTI",
            "symbol": "ULTI"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "561",
        "symbols": "ULTIWETH"
    },
    {
        "feeTier": "10000",
        "id": "0xa9df6536d606241e2708b3b6da63dd7163fb734d",
        "token0": {
            "decimals": "18",
            "id": "0x4f7a67464b5976d7547c860109e4432d50afb38e",
            "name": "Mainnet ETH",
            "symbol": "METH"
        },
        "token1": {
            "decimals": "18",
            "id": "0x517f2982701695d4e52f1ecfbef3ba31df470161",
            "name": "tBTC v2",
            "symbol": "tBTC"
        },
        "txCount": "16956",
        "symbols": "METHtBTC"
    },
    {
        "feeTier": "3000",
        "id": "0xc0b6f0c5d4c33c59b4672000d490992b7097ba40",
        "token0": {
            "decimals": "18",
            "id": "0xbbd3edd4d3b519c0d14965d9311185cfac8c3220",
            "name": "Yala BTC",
            "symbol": "YBTC"
        },
        "token1": {
            "decimals": "18",
            "id": "0xe0232d625ea3b94698f0a7dff702931b704083c9",
            "name": "Yala Stable Coin",
            "symbol": "YU"
        },
        "txCount": "28142",
        "symbols": "YBTCYU"
    },
    {
        "feeTier": "3000",
        "id": "0xc4545a0b4a87cbaff03a73f45c377c0b5f416e00",
        "token0": {
            "decimals": "18",
            "id": "0xbbd3edd4d3b519c0d14965d9311185cfac8c3220",
            "name": "Yala BTC",
            "symbol": "YBTC"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "139506",
        "symbols": "YBTCWETH"
    },
    {
        "feeTier": "10000",
        "id": "0xfac1138c5a426d26a6e350868eee6501788f1417",
        "token0": {
            "decimals": "18",
            "id": "0x810a3b22c91002155d305c4ce032978e3a97f8c4",
            "name": "MON",
            "symbol": "MON"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "48686",
        "symbols": "MONWETH"
    },
    {
        "feeTier": "3000",
        "id": "0xfc5fab0a82d2601fd4a1a5f11a8979c8fc95ab8a",
        "token0": {
            "decimals": "18",
            "id": "0x7352cdbca63f62358f08f6514d3b7ff2a2872aad",
            "name": "BOYMAT",
            "symbol": "BYT"
        },
        "token1": {
            "decimals": "18",
            "id": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
            "name": "Wrapped Ether",
            "symbol": "WETH"
        },
        "txCount": "4920",
        "symbols": "BYTWETH"
    }
];