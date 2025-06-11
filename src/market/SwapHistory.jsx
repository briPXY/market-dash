import { NumberSign } from "../Layout/Elements";

// Copy icon component
const CopyIcon = ({ className = "w-3 h-3 inline ml-1" }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
        <rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" />
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" />
    </svg>
);

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
                <span className="w-1/6 text-right">Wallet</span>
            </div>

            {/* Swap Data Rows */}
            <div className="space-y-2 border-secondary text-[11px] md:text-sm max-h-60 md:max-h-160 overflow-auto"> 
                {swaps.map((trade, index) => (
                    <div key={index} className="flex justify-between p-3">
                        <span className="w-1/6 text-left">{trade.date}</span>
                        
                        {/* Price: force wrap with CSS */}
                        <span className="w-1/6 text-center text-accent break-all" style={{ wordBreak: "break-all" }}>
                            ${typeof trade.price === "number" ? trade.price : Number(trade.price)}
                        </span>

                        {/* Total: force wrap with CSS */}
                        <span className="w-1/6 text-center break-all" style={{ wordBreak: "break-all" }}>
                            <NumberSign num={typeof trade.total === "number" ? trade.total : Number(trade.total)} baseNum={0} />
                        </span>

                        <span className="w-1/6 text-center ">{trade.amount}</span>

                        {/* Sender: wrap and add copy button */}
                        {/* <span className="w-1/6 text-center text-washed cursor-pointer rounded-md hover:text-white break-all flex flex-col items-center md:flex-row md:items-center md:justify-center">
                            <span className="break-all">{trade.sender.slice(0, 4) + "..." + trade.sender.slice(-10)}</span>
                            <button
                                className="ml-1 p-0.5 rounded hover:bg-secondary"
                                title="Copy"
                                onClick={() => copy(trade.sender)}
                                tabIndex={-1}
                            >
                                <CopyIcon />
                            </button>
                        </span> */}

                        {/* Recipient: wrap and add copy button */}
                        <span className="w-1/6 text-right text-washed cursor-pointer rounded-md hover:text-white break-all flex flex-col items-end md:flex-row md:items-center md:justify-end">
                            <span className="break-all">{trade.recipient.slice(0, 4) + "..." + trade.recipient.slice(-10)}</span>
                            <button
                                className="ml-1 p-0.5 rounded hover:bg-secondary"
                                title="Copy"
                                onClick={() => copy(trade.recipient)}
                                tabIndex={-1}
                            >
                                <CopyIcon />
                            </button>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
};