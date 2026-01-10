import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const timeframeMapping = {
    "1h": { type: "poolHourDatas", timeField: "periodStartUnix" },
    "1d": { type: "poolDayDatas", timeField: "date" }
};

export async function subgraphHistoricalPriceQuery(poolAddress, timeframe, API_KEY, subGraphId) {
    const { type, timeField } = timeframeMapping[timeframe];

    const query = `{
            ${type}(
                first: 500,
                orderBy: ${timeField},
                orderDirection: desc,
                where: { pool_: { id: "${poolAddress.toLowerCase()}" } }
            ) {
                ${timeField}
                open
                high
                low
                close
                volumeUSD
            }
    }`;

    try {
        const response = await axios.post(
            `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${subGraphId}`,
            { query },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error("\x1b[31m Subgraph historical graphQL querying error:\x1b[0m", error);
        throw new Error(error);
    }
}


export async function subgraphTradeHistoryQuery(poolAddress, items = 32, API_KEY, subGraphId) {

    const query = `{ 
            swaps(
                first: ${items},
                orderBy: timestamp,
                orderDirection: desc,
                where: { pool_: { id: "${poolAddress.toLowerCase()}" } }
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
            `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${subGraphId}`,
            { query },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error("\x1b[31m subgraphTradeHistoryQuery graphQL querying error:\x1b[0m", error);
        throw new Error(error);
    }
}
