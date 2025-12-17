import { MissingAPIKeyError } from "../../constants/environment";
import { LoadingIcon } from "../../Layout/svg";
import { chartDim } from "../../charts/config"
import { useModalVisibilityStore, useWalletStore } from "../../stores/stores";

export function PreChartScreen({ isError, error, isLoading }) {
    const walletConnected = useWalletStore(state => state.isConnected);

    return (
        <div style={{ height: `${chartDim.containerHeight}px` }} className="flex w-full items-center justify-center bg-primary-900 z-10 absolute top-0 left-0">
            {isLoading || !isError && <LoadingIcon className="w-5 h-5" />}
            {isError && (error instanceof MissingAPIKeyError) &&
                <div>
                    <div className="font-semibold">{error.message}</div>
                    {!walletConnected && <div className="text-sm mt-2"><b onClick={() => useModalVisibilityStore.getState().setModalVisibility("wallet", true)} className="cursor-pointer text-primary decoration-solid">Login</b> to set your API keys.</div>}
                    {walletConnected && <div className="text-sm mt-2">You are connected, go to <b onClick={() => useModalVisibilityStore.getState().setModalVisibility("userSetting", true)} className="cursor-pointer text-primary decoration-solid">Setting</b> to set API key</div>}
                </div>
            }
        </div>
    );
}