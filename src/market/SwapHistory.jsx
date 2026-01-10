import { usePoolStore, useTradingPlatformStore, useWalletStore } from "../stores/stores";
import { PriceText } from "../generic_components/PriceText";
import { useEffect, useRef, useState } from "react";
// import { ToggleButton } from "../Layout/Elements";
import { CopyIcon, LoadingIcon, RefreshIcon } from "../Layout/svg";
import { SvgMemo } from "../Layout/Layout";
import { decryptAndLoadUserSecret } from "../utils/user";
import { DOMAIN } from "../constants/environment";
import { formatSwapData } from "../utils/utils";
import { debounce } from "lodash";

async function getSwapHistory(poolAddress, set = () => { }, callback) {
    try {
        const walletStoreObj = useWalletStore.getState();
        const apiKey = await decryptAndLoadUserSecret("Subgraph API Key", walletStoreObj.address, walletStoreObj.signature);
        const response = await fetch(`${DOMAIN}/api/v1/trades/subgraph/18/${poolAddress}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });

        const json = await response.json();

        if (!response.ok || json.data.swaps.length < 2) {
            set([]);
        }
        set(formatSwapData(json.data.swaps));
    } catch (e) {
        console.error(e)
    } finally { callback() }
}

const debouncedSwapHistory = debounce(getSwapHistory, 3000);

// const toggleHeight = (ref) => {
//     const el = ref.current;
//     if (!el) return;

//     if (el.style.height === '32em' || !el.style.height) {
//         el.style.height = el.scrollHeight + "px" // open
//     } else {
//         el.style.height = '32em'; // close
//     }
// };

export const SwapHistory = () => {
    const traderValidityInfo = usePoolStore(state => state.validatedInfo);
    const address = usePoolStore(state => state.address);
    const trader = useTradingPlatformStore(state => state.trader);
    const listBoxRef = useRef(null);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (trader != "Uniswap" || !traderValidityInfo) return;
        setLoading(true);
        debouncedSwapHistory(address, setSwaps, () => setLoading(false));
    }, [address, trader, traderValidityInfo]);

    const onRefreshClick = () => { // no debouncing for user triggered
        setLoading(true);
        getSwapHistory(address, setSwaps, () => setLoading(false));
    };

    if (loading) return (<LoadingIcon className="w-4 mx-auto h-full" />);

    if (swaps?.length < 2 || trader != "Uniswap" || !traderValidityInfo) return (<div className="text-xs p-3 text-washed-dim">No swap data</div>);

    const copy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="w-full h-full p-3">
            <div className="flex items-center justify-between mb-3 text-xxs text-washed font-medium">
                <div className="text-xs text-white">Swap History</div>
                <div>{`${address.slice(0, 6)}...${address.slice(-6)}`}</div>
                <div>{`Fee: ${usePoolStore.getState().feeTier / 10000}%`}</div>
                <button className="flex items-center gap-0.5 border border-primary-100 rounded-sm bg-primary-500 px-1" onClick={() => onRefreshClick()}>
                    <RefreshIcon size={8} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Column Labels */}
            <div className="flex justify-between py-1 my-1 text-washed text-xxs border-y border-primary-100">
                <span className="flex-1 text-left">Time</span>
                <span className="flex-1 text-left">Price</span>
                <div className="flex-1 text-left">{`Amount (${usePoolStore.getState().token0.symbol})`}</div>
                <div className="flex-1 text-right">{`Amount (${usePoolStore.getState().token1.symbol})`}</div>
            </div>

            {/* Swap Data Rows */}
            <div
                ref={listBoxRef}
                style={{
                    scrollbarWidth: 'none',       // Hides scrollbar in Firefox
                    msOverflowStyle: 'none',     // Hides scrollbar in IE/Edge
                    scrollbarGutter: 'stable'    // Prevents layout shift (scrollbar doesn't change width)
                }}
                className="h-full overflow-y-auto snap-y scroll-pb-3 [scrollbar-gutter:stable] text-xxs">
                {swaps.map((trade, index) => (
                    <SwapListItem key={index} trade={trade} copy={copy} />
                ))}
                <div className="pb-3"></div>

            </div>
            {/* <div className="flex justify-center bg-primary-500 rounded-b-lg text-xs md:text-sm">
                <ToggleButton className="text-sm rounded-b-lg px-2 py-2 md:px-4 w-full" onClick={() => toggleHeight(listBoxRef)}>
                    <div>Show more</div>
                    <div>Show less</div>
                </ToggleButton>
            </div> */}
        </div>
    )
};

function SwapListItem({ trade, copy }) {
    const [hover, setHover] = useState(false);

    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="hover:pb-2 hover:border-y border-primary-100">
            <div className="flex justify-between text-xxs py-1">
                <span className="flex-1 text-left">{trade.date}</span>
                <PriceText className="flex-1 text-left break-all" style={{ wordBreak: "break-all" }} input={trade.price.toString()} />
                <span className="flex-1 text-left break-all" style={{ wordBreak: "break-all" }}>
                    {typeof trade.total === "number" ? trade.total : Number(trade.total)}
                </span>
                <span className="flex-1 text-right">{trade.amount}</span>
            </div>
            <div style={{ display: hover ? "flex" : "none" }} className="text-washed cursor-pointer gap-1 items-center justify-center mx-auto w-full hover:text-primary">
                <span>Trader:</span>
                <span className="cursor-pointer" onClick={() => copy(trade.recipient)}> {trade.recipient.slice(0, 8) + "..." + trade.recipient.slice(-8)}</span>
                <SvgMemo >
                    <CopyIcon className="w-3.5" />
                </SvgMemo>
            </div>
        </div>
    );
}