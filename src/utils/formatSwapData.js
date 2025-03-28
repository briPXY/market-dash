export const formatSwapData = (swaps) => {
    return swaps.map((trade) => {
        const date = new Date(parseInt(trade.timestamp) * 1000).toLocaleString();
        const price = Math.abs(parseFloat(trade.amount1) / parseFloat(trade.amount0)).toFixed(6);
        const total = parseFloat(trade.amount0).toFixed(4);
        const amount = Math.abs(parseFloat(trade.amount1)).toFixed(2);
        const sender = trade.sender;
        const recipient = trade.recipient; 

        return {
            date,
            price,
            total,
            amount,
            sender,
            recipient, 
        };
    });
};