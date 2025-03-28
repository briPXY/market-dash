import { NumberSign } from "../Layout/elements";

export const SwapHistory = ({ swaps }) => {

    if (!swaps) return;

    const copy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="w-full bg-primary p-4">
            <div className="mb-3 rounded-md bg-secondary text-xs md:text-sm w-fit p-2">Trades History</div>

            {/* Column Labels */}
            <div className="flex justify-between px-3 py-2 bg-secondary text-washed rounded-t-md text-xs md:text-sm">
                <span className="w-1/6 text-left">Date</span>
                <span className="w-1/6 text-center">Price</span>
                <span className="w-1/6 text-center">Total</span>
                <span className="w-1/6 text-center">Amount</span>
                <span className="w-1/6 text-center">Sender</span>
                <span className="w-1/6 text-right">Recipient</span>
            </div>

            {/* Swap Data Rows */}
            <div className="space-y-2 border-secondary text-[11px] md:text-sm max-h-60 md:max-h-160 overflow-auto"> 
                {swaps.map((trade, index) => (
                    <div key={index} className="flex justify-between p-3">
                        <span className="w-1/6 text-left">{trade.date}</span>
                        <span className="w-1/6 text-center text-accent">${trade.price}</span>
                        <NumberSign className="w-1/6 text-center" num={trade.total} baseNum={0} />
                        <span className="w-1/6 text-center ">{trade.amount}</span>
                        <span className="w-1/6 text-center text-washed cursor-pointer rounded-md hover:text-white" onClick={() => copy(trade.sender)}>
                            {trade.sender.slice(0, 6) + "..." + trade.sender.slice(-4)}
                        </span>
                        <span className="w-1/6 text-right text-washed cursor-pointer rounded-md hover:text-white" onClick={() => copy(trade.recipient)}>
                            {trade.recipient.slice(0, 6) + "..." + trade.recipient.slice(-4)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
};