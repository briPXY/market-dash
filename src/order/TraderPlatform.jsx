import { useEffect, useState } from 'react';

import { PopoverButton } from "../Layout/Elements";
import { ExchangeIcon } from "@web3icons/react/dynamic";
import { useNetworkStore, usePoolStore, useTradingPlatformStore } from '../stores/stores';
import { Traders } from '../constants/constants';

export const TraderPlatform = () => {
    const platform = useTradingPlatformStore(state => state.trader);
    const chainId = useNetworkStore(state => state.chainId);
    const symbols = usePoolStore(state => state.symbols);
    const [validty, setValidity] = useState(-1); // -1 = loading

    const OptionComponent = Traders[platform].optionComponent;

    // pair validation
    useEffect(() => {
        const validateTokens = async () => {
            if (!symbols == "init") {
                return;
            }

            try {  
                setValidity(-1);
                const isPairValid = await Traders[platform].pairValidator(usePoolStore.getState(), useNetworkStore.getState().chain, chainId);
                setValidity(Number(isPairValid));
            } catch (e) {
                e;
                setValidity(0);
            }
        }

        validateTokens();
    }, [chainId, platform, symbols]);

    return (
        <div className="flex flex-wrap items-center px-3 py-3 gap-1 bg-primary-900 text-xs mt-1.5">
            <PopoverButton className="flex-1">
                <button className="cursor-pointer gap-1 p-1 px-2 bg-primary-500 border border-primary-100 rounded-sm flex justify-center items-center w-full">
                    <div className="text-washed">Trader:</div>
                    <div className="font-medium">{platform}</div>
                    <ExchangeIcon id={platform} size={18} variant="branded" />
                </button>
                <div className="bg-primary-900 border border-primary-100 w-full">
                    {Object.keys(Traders).map(e => (<div key={e} className="p-3 text-sm cursor-pointer hover:brightness-125 bg-primary-900">{e}</div>))}
                </div>
            </PopoverButton>
            <OptionComponent validity={validty}  />
        </div>
    );
};