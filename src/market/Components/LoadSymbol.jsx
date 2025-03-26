import { useEffect } from "react";
import { isSavedStateExist, loadState } from "../../idb/stateDB";
import { useSymbolStore } from "../../stores/stores";

export const LoadSymbol = ({ src }) => {
    const setAll = useSymbolStore(fn => fn.setAll);

    const checkSavedState = async () => {
        const exist = await isSavedStateExist(`savedTick-${src}`);

        if (exist) {
            const state = await loadState(`savedTick-${src}`);
            console.log(exist);
            setAll(state[0], state[1]);
        }
        else {
            console.log(src, exist);
            setAll("ETH", "USDT");
        }
    }

    useEffect(() => {
        checkSavedState(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="w-full bg-primary h-screen">
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 rounded-lg mx-auto max-w-100 p-10">
                <div className="text-sm">Loading symbols...</div>
            </div>
        </div>
    )
}