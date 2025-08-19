import { usePoolStore, useSourceStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";
import { PriceText } from "../generic_components/PriceText";
import { TokenIcon } from "@web3icons/react";
import { useRef } from "react";
import { ToggleButton } from "../Layout/Elements";
import { CopyIcon } from "../Layout/svg";
import { SvgMemo } from "../Layout/Layout";

const toggleHeight = (ref) => {
    const el = ref.current;
    if (!el) return;

    if (el.style.height === '32em' || !el.style.height) {
        el.style.height = el.scrollHeight + "px" // open
    } else {
        el.style.height = '32em'; // close
    }
};

export const SwapHistory = ({ swaps }) => {
    const { address } = usePoolStore();
    const { src } = useSourceStore();
    const listBoxRef = useRef(null);

    if (!swaps || !src) return;

    const copy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="w-full bg-primary-900 p-4">
            <div className="mb-3 mt-4 text-xs md:text-base">Transactions</div>

            {/* Column Labels */}
            <div className="flex justify-between px-2 py-1 md:px-4 md:py-3 bg-primary-500 text-washed rounded-t-lg text-xs md:text-sm">
                <span className="w-1/6 text-left text-white">Date</span>
                <span className="w-1/6 text-center text-white">Price</span>
                <div className="flex gap-0.5 text-[0.8em] justify-center items-center w-1/6 text-center text-white">
                    <TokenIcon size={18} variant="mono" color="#fff" symbol={SourceConst[src].info[address].token0.symbol.toLowerCase()} />
                    <span >{SourceConst[src].info[address].token0.symbol}</span>
                </div>
                <div className="flex gap-0.5 text-[0.8em] justify-center items-center w-1/6 text-center text-white">
                    <TokenIcon size={18} variant="mono" color="#fff" symbol={SourceConst[src].info[address].token1.symbol.toLowerCase()} />
                    <span >{SourceConst[src].info[address].token1.symbol}</span>
                </div>
                <span className="w-1/6 text-right text-white">Address</span>
            </div>

            {/* Swap Data Rows */}
            <div
                ref={listBoxRef}
                style={{ height: '32em', overflow: 'hidden', transition: 'height 0.3s ease' }}
                className="border-secondary text-[11px] md:text-sm">
                {swaps.map((trade, index) => (
                    <div key={index} className="flex justify-between py-1 md:py-3 md:px-4 px-2">
                        <span className="w-1/6 text-left">{trade.date}</span>

                        {/* Price: force wrap with CSS */}
                        <PriceText className="w-1/6 text-center text-accent break-all" style={{ wordBreak: "break-all" }}
                            input={trade.price.toString()}
                        />

                        {/* Total: force wrap with CSS */}
                        <span className="w-1/6 text-center break-all" style={{ wordBreak: "break-all" }}>
                            {typeof trade.total === "number" ? trade.total : Number(trade.total)}
                        </span>

                        <span className="w-1/6 text-center ">{trade.amount}</span>

                        {/* Sender: wrap and add copy button */}
                        {/* <span className="w-1/6 text-center text-washed cursor-pointer rounded-md hover:text-white break-all flex flex-col items-center md:flex-row md:items-center md:justify-center">
                            <span className="break-all">{trade.sender.slice(0, 4) + "..." + trade.sender.slice(-10)}</span>
                            <button
                                className="ml-1 p-0.5 rounded hover:bg-primary-500"
                                title="Copy"
                                onClick={() => copy(trade.sender)}
                                tabIndex={-1}
                            >
                                <CopyIcon />
                            </button>
                        </span> */}

                        {/* Recipient: wrap and add copy button */}
                        <span className="w-1/6 text-right text-washed cursor-pointer rounded-md hover:text-white break-all flex flex-col items-end md:flex-row md:items-center md:justify-end">
                            <span className="break-all">{trade.recipient.slice(0, 4) + "..." + trade.recipient.slice(-8)}</span>
                            <button
                                className="ml-1 p-0.5 rounded hover:bg-primary-500"
                                title="Copy"
                                onClick={() => copy(trade.recipient)}
                                tabIndex={-1}
                            >
                                <SvgMemo>
                                    <CopyIcon width="11"/>
                                </SvgMemo>
                            </button>
                        </span>
                    </div>
                ))}
                
            </div>
            <div className="flex justify-center bg-primary-500 rounded-b-lg text-xs md:text-sm">
                <ToggleButton className="text-sm rounded-b-lg px-2 py-2 md:px-4 w-full" onClick={() => toggleHeight(listBoxRef)}>
                    <div>Show more</div>
                    <div>Show less</div>
                </ToggleButton>
            </div>
        </div>
    )
};