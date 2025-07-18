import axios from "axios";
import dotenv from "dotenv";

import { historicalData } from "../memory/prices.memory.js";
import Subgraphs from "../constants/subgraph.adapter.js";

dotenv.config(); // Load .env variables

const timeframeMapping = {
    "1h": { type: "poolHourDatas", timeField: "periodStartUnix" },
    "1d": { type: "poolDayDatas", timeField: "date" }
};

async function uniswapQuery(network, poolAddress, timeframe, count, pairString, subGraphAddress) {
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
                first: 32,
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
            `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_API_KEY}/subgraphs/id/${subGraphAddress}`,
            { query },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        historicalData[network][timeframe][pairString] = response.data.data;
    } catch (error) {
        console.error("\x1b[31m Subgraph historical graphQL querying error:\x1b[0m", error);
        throw new Error(error);
    }
}

const networks = Object.keys(Subgraphs);

for (const network of networks) {
    historicalData[network] = {
        "1h": {},
        "1d": {}
    };

    const tokenPairsArray = Object.keys(Subgraphs[network].pools);
    const subgraphID = Subgraphs[network].id;

    // Initial data
    tokenPairsArray.forEach((tokenPair) => {
        const poolAdress = Subgraphs[network].pools[tokenPair];
        uniswapQuery(network, poolAdress, "1d", 500, tokenPair, subgraphID);
        uniswapQuery(network, poolAdress, "1h", 500, tokenPair, subgraphID);
    });

    setInterval(() => {
        tokenPairsArray.forEach((tokenPair) => {
            const poolAdress = Subgraphs[network].pools[tokenPair];
            uniswapQuery(network, poolAdress, "1d", 500, tokenPair, subgraphID);
            uniswapQuery(network, poolAdress, "1h", 500, tokenPair, subgraphID);
        });
    }, 3600000) // Both day and hour fetched each hour because it's unknown when TheGraph cycle it's indexing the uniswap.
}

