import { WalletLogin } from "../order/Login";
import Button from "../Layout/Elements"
import { Flex } from "../Layout/Layout"
import { useWalletStore } from "../stores/stores";
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = ({ handleNetworkChange }) => {
    const address = useWalletStore(state => state.address);

    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary-900 py-4 p-2 md:p-4">
            <NetworkSelector handleNetworkChange={handleNetworkChange} />
            <Flex className="justify-end">
                {!address && <WalletLogin className="text-xs p-2 bg-primary-500 rounded-sm text-white" text="Login" />}
                {address &&
                    <Button className="p-2 text-sm">
                        <div className="text-xs truncate max-w-20">{address}</div>
                    </Button>
                }
            </Flex>
        </Flex>
    );
}