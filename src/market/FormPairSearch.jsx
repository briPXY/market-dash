// import { debounce } from "lodash";
import { useRef, useState } from "react";
import { TokenIcon } from "@web3icons/react/dynamic";
import { sortByRelevance, stdSymbol } from "../utils/utils";
import { usePoolStore, useSourceStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";
import { searchPairListDoubleIndex } from "../idb/pairListDB";
import { ChainId } from "../constants/constants";
// import { IconFallback } from "../generic_components/IconFallback";

const ResultItem = ({ pairInfo }) => {
    const itemClickHandle = async (tokenObj) => {
        if (tokenObj.token0) {
            usePoolStore.getState().setPairFromPairObj(tokenObj);
        }
        else {
            usePoolStore.getState().setPairFromListDB(tokenObj);
        }
    };

    return (
        <div
            onClick={() => itemClickHandle(pairInfo)} className="flex items-center p-2 bg-primary-900 cursor-pointer text-xs hover:brightness-125">
            <TokenIcon
                symbol={stdSymbol(pairInfo.symbol0).toLowerCase()}
                size={18}
                variant="branded"
                className="rounded-xs"
                fallback={"/icon-fallback.jpg"}
            />
            <TokenIcon
                symbol={stdSymbol(pairInfo.symbol1).toLowerCase()}
                size={18}
                variant="branded"
                className="rounded-xs"
                fallback={"/icon-fallback.jpg"}
            />
            <div className="font-semibold">{`${pairInfo.symbol0}-${pairInfo.symbol1}`}</div>
            {/* <div className="text-left truncate text-washed font-light">{availableStatus}</div> */}
        </div>
    );
};

export const FormPairSearch = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [input, setInput] = useState(null);
    const [data, setData] = useState(null);
    const sourceName = useSourceStore(state => state.src);
    const [isSearching, setIsSearching] = useState(false);
    const abortControllerRef = useRef(null);
    const [chainName, chainId] = sourceName ? sourceName.split(':') : ["", ""];

    const handleInputWithAbort = async (e) => {
        setIsSearching(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const newController = new AbortController();
        abortControllerRef.current = newController;
        const signal = newController.signal;

        const output = await searchPairListDoubleIndex(sourceName, e.toUpperCase(), 20, signal);
        let sortedOutput = sortByRelevance(output, "symbols", e);

        setData(sortedOutput);
        setIsSearching(false);
    }

    return (
        <div
            style={{ position: "relative" }}
            className={className}
        >
            <input
                type="text"
                placeholder={`Search ${chainName}${ChainId[useSourceStore.getState().data.blockchain] ? ` ${ChainId[useSourceStore.getState().data.blockchain][chainId]}` : ""} pairs`}
                onChange={(e) => handleInputWithAbort(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 1000)}
                className="p-2 py-3 bg-primary-100 text-xs font-light rounded-sm w-full">
            </input>

            {/* Popover Content */}
            {isOpen &&
                <div
                    style={{ width: '100%', left: 0, overflowX: 'auto' }}
                    className={`absolute mt-1 z-20 flex flex-col rounded-sm bg-primary-900 shadow-md overflow-scroll border border-primary-100 pb-4`}>
                    {data && data.map((e, i) => <ResultItem key={`${e.symbol}${i}`} pairInfo={e} setIsOpen={setIsOpen} />)}
                    {!data && <div className="text-xs text-washed mt-2">No result yet</div>}
                    {data?.length == 0 && <div className="text-xs text-washed mt-2">{`No ${SourceConst[sourceName].name} pair listed`}</div>}
                    {isSearching && <div className="text-xs text-washed mt-2"><i>Searching...</i></div>}
                </div>
            }
        </div>
    );
};

