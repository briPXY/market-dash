import axios from "axios";
import dotenv from "dotenv";

import { PoolAddress } from "../constants/poolAddress.js";
import { historicalData } from "../memory/historicalData.js";

dotenv.config(); // Load .env variables

historicalData.UniswapV3 = {
    "1h": {},
    "1d": {}
};

const timeframeMapping = {
    "1h": { type: "poolHourDatas", timeField: "periodStartUnix" },
    "1d": { type: "poolDayDatas", timeField: "date" }
};

async function uniswapQuery(poolAddress, timeframe, count, pairString) {
    const { type, timeField } = timeframeMapping[timeframe];

    const query = `{
            ${type}(
                first: ${count},
                orderBy: ${timeField},
                orderDirection: desc,
                where: { 
                    pool: "${poolAddress}"
                    }
            ) {
                ${timeField}
                open
                high
                low
                close
                volumeUSD
            }

            swaps(
                first: 50,
                orderBy: timestamp,
                orderDirection: desc,
                where: { pool: "${poolAddress}" }
            ) {
                timestamp
                amount0
                amount1
                sender
                recipient
                transaction {
                id
                }
                token0 {
                    symbol
                }
                token1 {
                    symbol
                }
            }
    }`;

    try {
        const response = await axios.post(
            // eslint-disable-next-line no-undef
            process.env.SUBGRAPH_URL, // Use Uniswap Subgraph URL from .env
            { query },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        historicalData.UniswapV3[timeframe][pairString] = response.data.data;
    } catch (error) {
        console.error("\x1b[31m Subgraph historical graphQL querying error:\x1b[0m", error);
        throw new Error(error);
    }
}

// Initial data
Object.keys(PoolAddress.UniswapV3).forEach((symbol) => {
    uniswapQuery(PoolAddress.UniswapV3[symbol], "1d", 500, symbol);
    uniswapQuery(PoolAddress.UniswapV3[symbol], "1h", 500, symbol);
});

setInterval(() => {
    Object.keys(PoolAddress.UniswapV3).forEach((symbol) => {
        uniswapQuery(PoolAddress.UniswapV3[symbol], "1d", 500, symbol);
        uniswapQuery(PoolAddress.UniswapV3[symbol], "1h", 500, symbol);
    });
}, 3600000) // Both day and hour fetched each hour because it's unknown when TheGraph cycle it's indexing the uniswap.