import { MissingAPIKeyError } from "../../constants/environment";
import { LoadingIcon } from "../../Layout/svg";
import { chartDim } from "../../charts/config"
import { useModalVisibilityStore, usePoolStore, useWalletStore } from "../../stores/stores";
import { useMemo } from "react";

export function PreChartScreen({ isError, error, isFetching, dataSymbols }) {
    const walletConnected = useWalletStore(state => state.isConnected);
    const symbols = usePoolStore(state => state.symbols)
    const dataPending = useMemo(() => {
        if (dataSymbols != symbols) {
            return true;
        }

        return false
    }, [dataSymbols, symbols]);

    if (!isFetching && !isError) {
        return null;
    }

    if (isFetching || (dataPending && !isError)) {
        return (
            <PreChartScreenContainer>
                <LoadingIcon className="w-5 h-5" />
            </PreChartScreenContainer>
        );
    }

    else if (isError && (error instanceof MissingAPIKeyError)) {
        return (
            <PreChartScreenContainer>
                <div>
                    <div className="font-semibold"><span className="text-accent-negative mr-2">⚠</span>{error.message}</div>
                    {!walletConnected && <div className="text-sm mt-2"><b onClick={() => useModalVisibilityStore.getState().setModalVisibility("wallet", true)} className="cursor-pointer text-primary decoration-solid">Login</b> to set your API keys.</div>}
                    {walletConnected && <div className="text-sm mt-2">You are connected, go to <b onClick={() => useModalVisibilityStore.getState().setModalVisibility("userSetting", true)} className="cursor-pointer text-primary decoration-solid">Setting</b> to set API key</div>}
                </div>
            </PreChartScreenContainer>
        );
    }

    else {
        <div className="font-semibold"><span className="text-accent-negative mr-2">⚠</span>{error.message}</div>
    }
}

const PreChartScreenContainer = ({ children }) => (<div style={{ height: `${chartDim.containerHeight}px` }} className="flex w-full items-center justify-center bg-primary-900 z-10 absolute top-0 left-0">{children}</div>);