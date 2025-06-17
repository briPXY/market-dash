import axios from "axios";
import dotenv from "dotenv";

import { PoolAddress } from "./poolAddress.js";

dotenv.config(); // Load .env variables

export const queryRespData = {
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

        queryRespData[timeframe][pairString] = response.data.data;
    } catch (error) {
        console.error("\x1b[31mUniswapQuery error:\x1b[0m", error);
        throw new Error(error);
    }
}

// Initial data
Object.keys(PoolAddress.UniswapV3).forEach((symbol) => {
    uniswapQuery(PoolAddress.UniswapV3[symbol], "1d", 300, symbol);
    uniswapQuery(PoolAddress.UniswapV3[symbol], "1h", 300, symbol);
});

setInterval(() => {
    Object.keys(PoolAddress.UniswapV3).forEach((symbol) => {
        uniswapQuery(PoolAddress.UniswapV3[symbol], "1d", 300, symbol);
        uniswapQuery(PoolAddress.UniswapV3[symbol], "1h", 300, symbol);
    });
}, 3600000) // Both day and hour fetched each hour because it's unknown when TheGraph cycle it's indexing the uniswap.