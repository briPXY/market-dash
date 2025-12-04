// import { debounce } from "lodash";
import { useRef, useState } from "react";
import { searchTokensRegex } from "../idb/tokenListDB";
import { TokenIcon } from "@web3icons/react/dynamic";
import { sortByRelevance, stdSymbol } from "../utils/utils";
import { usePoolStore, useSourceStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";
// import { IconFallback } from "../generic_components/IconFallback";

const ResultItem = ({ tokenInfo, target, setIsOpen }) => {
    const [availableStatus, setAvaliableStatus] = useState("");
    const priceSource = useSourceStore(state => state.src);
    const setPair = usePoolStore(state => state.setSingleSymbol);

    const itemClickHandle = async (arg) => {
        const sideSymbol = target == "token0" ? usePoolStore.getState().symbol1 : usePoolStore.getState().symbol0;
        const priceDataAvailable = await SourceConst[priceSource].symbolCheck(arg.symbol, sideSymbol);

        if (priceDataAvailable) {
            setPair(target, arg);
            setAvaliableStatus("Available!");
            setIsOpen(false);
        }
        else {
            setAvaliableStatus("Price information unavailable");
        }
    };

    return (
        <div
            onClick={() => itemClickHandle(tokenInfo)} className="flex gap-1 items-center p-2 bg-primary-100 cursor-pointer text-xs hover:brightness-125">
            <TokenIcon
                symbol={stdSymbol(tokenInfo.symbol).toLowerCase()}
                size={18}
                className="rounded-xs"
                fallback={tokenInfo.logoURI || "/icon-fallback.jpg"}
            />
            <div className="font-semibold">{tokenInfo.symbol}</div>
            <div className="text-left truncate text-washed font-light">{availableStatus == "" ? tokenInfo.name : availableStatus}</div>
        </div>
    );
};

export const TokenPairSearchForm = ({
    className = '',
    target = "token0",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [input, setInput] = useState(null);
    const [data, setData] = useState(null);
    const [hoverResult, setHoverResult] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const abortControllerRef = useRef(null);

    // const debouncedSetInput = useMemo(
    //     () =>
    //         debounce((value) => {
    //             setInput(value);
    //         }, 1000),
    //     [setInput]
    // );

    // const handleInput = (e) => {
    //     debouncedSetInput(e);
    // };

    const handleInputWithAbort = async (e) => {
        setIsSearching(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const newController = new AbortController();
        abortControllerRef.current = newController;
        const signal = newController.signal;
        const output = await searchTokensRegex(e, signal);

        let sortedOutput;

        if (e.length >= 6) {
            sortedOutput = sortByRelevance(output, "name", e);
        }
        else {
            sortedOutput = sortByRelevance(output, "symbol", e);
        }

        setData(sortedOutput);
        setIsSearching(false);
    }

    const handleInputLeave = () => {
        if (!hoverResult) {
            setIsOpen(false);
        }
    }

    // useEffect(() => {
    //     async function handleSearch() {
    //         setIsSearching(true);
    //         const output = await searchTokensRegex(input);
    //         setData(output);
    //         setIsSearching(false);
    //     }

    //     handleSearch();
    // }, [input]);

    return (
        <div
            style={{ position: "relative" }}
            className={className}
        >
            <input
                type="text"
                placeholder="Search token"
                onChange={(e) => handleInputWithAbort(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={handleInputLeave}
                className="p-2 border border-washed-dim text-xs font-light rounded-sm w-full">
            </input>

            {/* Popover Content */}
            {isOpen &&
                <div
                    onMouseEnter={() => setHoverResult(true)}
                    onMouseLeave={() => setHoverResult(false)}
                    style={{ width: '200%', left: 0, overflowX: 'auto' }}
                    className={`absolute mt-1 z-20 flex flex-col rounded-md bg-primary-100 shadow-md pb-4`}>
                    {data && data.map(e => <ResultItem key={e.address} tokenInfo={e} target={target} setIsOpen={setIsOpen} />)}
                    {!data && <div className="text-xs text-washed mt-2">No result yet</div>}
                    {data?.length == 0 && <div className="text-xs text-washed mt-2">No token listed</div>}
                    {isSearching && <div className="text-xs text-washed mt-2"><i>Searching...</i></div>}
                </div>
            }
        </div>
    );
};

