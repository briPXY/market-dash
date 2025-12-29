import { useCallback, useEffect, useState } from 'react';
import { usePoolStore } from '../../stores/stores';
import { PopoverButton } from '../../Layout/Elements';

export const UniswapOptionPanel = ({ validity }) => {
    const uniswapOptions = usePoolStore(state => state.validatedInfo);
    const [versionFee, setVersionFee] = useState([]);

    const setFee = useCallback((version, fee) => {
        setVersionFee([version, fee]);
        usePoolStore.getState().setState("feeTier", Number(fee.replace('%', '')) * 10000);
        usePoolStore.getState().setState("address", uniswapOptions[version][fee]);
    }, [uniswapOptions])

    const activeStyle = { fontWeight: 700, color: "var(--c-primary)", background: "var(--c-primary-100)" }

    useEffect(() => {
        if (uniswapOptions) {
            const ver = Object.keys(uniswapOptions);
            const fee = Object.keys(uniswapOptions[ver[0]])[0];
            setFee(ver[0], fee);
        }
    }, [setFee, uniswapOptions]);

    if (!uniswapOptions) {
        return (<div className='flex-1 text-xs text-washed'>{validity == -1 ? "Validating tokens..." : "No pool for current pair/network"}</div>)
    }

    return (
        <PopoverButton className='flex-1'>
            <button className='text-xs rounded-sm border border-primary-100 bg-primary-500 w-full p-1 px-2'>{`${versionFee[0]} (fee: ${versionFee[1]})`}</button>
            <div>
                {Object.keys(uniswapOptions).map(e => (
                    <div className='flex p-2 border rounded-md bg-primary-500 border-primary-100' key={e}>
                        <div className='font-semibold text-washed p-1 gap-3'>{e}</div>
                        <div className='flex flex-1'>
                            {Object.keys(uniswapOptions[e]).map(fee => (
                                <button
                                    className='p-1 flex-1 rounded-md bg-primary-500'
                                    style={e == versionFee[0] && fee == versionFee[1] ? activeStyle : {}}
                                    onClick={() => setFee(e, fee)} key={fee}>
                                    {fee}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </PopoverButton>
    );
};