import { BlockyAvatar } from "../Layout/svg";
import { Flex } from "../Layout/Layout"
import { useModalVisibilityStore, useWalletStore } from "../stores/stores";
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = () => {
    const { setModalVisibility } = useModalVisibilityStore();
    const address = useWalletStore(state => state.address);
    const addressText = address ? `${address.slice(0, 6)}...${address.slice(address.length - 5)}` : "Not logged-in";

    return (
        <Flex className="justify-between items-center w-full bg-primary-900 py-3 px-2 md:px-4">
            <NetworkSelector />
            <Flex className="justify-end">
                {!address && <button onClick={() => setModalVisibility("wallet", true)} className="text-xs px-3 py-1 rounded-full border border-washed" >Login</button>}
                {address &&
                    <div onClick={() => setModalVisibility("account", true)} className="md:p-2 md:pr-3 md:border border-primary-100 flex items-center rounded-full cursor-pointer md:bg-primary-500 gap-1 text-sm">
                        <BlockyAvatar address={address} size={25} className="rounded-full" />
                        <div className="text-xs hidden md:block">{addressText}</div>
                    </div>
                }
            </Flex>
        </Flex>
    );
}