import { BlockyAvatar } from "../Layout/svg";
import Button from "../Layout/Elements"
import { Flex } from "../Layout/Layout"
import { useModalVisibilityStore, useWalletStore } from "../stores/stores";
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = ({ initState }) => {
    const { setModalVisibility } = useModalVisibilityStore();
    const address = useWalletStore(state => state.address);
    const addressText = address ? `${address.slice(0, 6)}...${address.slice(address.length - 5)}` : "Not logged-in";

    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary-900 py-4 p-2 md:p-4">
            <NetworkSelector initState={initState} />
            <Flex className="justify-end">
                {!address && <button onClick={() => setModalVisibility("wallet", true)} className="text-xs p-2 bg-primary-500 rounded-sm text-white" >Login</button>}
                {address &&
                    <Button onClick={() => setModalVisibility("account", true)} className="p-2 gap-1 text-sm">
                        <BlockyAvatar address={address} size={22} className="rounded-full" />
                        <div className="text-xs">{addressText}</div>
                    </Button>
                }
            </Flex>
        </Flex>
    );
}