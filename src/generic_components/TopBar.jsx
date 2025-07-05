import Button from "../Layout/Elements"
import { Flex } from "../Layout/Layout"
import { useWalletStore } from "../stores/stores";
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = () => {
    const address = useWalletStore(state => state.address);

    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary py-4 p-2 md:p-4">
            <NetworkSelector />
            <Flex className="justify-end">
                {!address && <Button className="p-1 text-sm">Login</Button>}
                {address &&
                    <Button className="p-2 text-sm">
                        <div className="text-xs truncate max-w-20">{address}</div>
                    </Button>
                }
            </Flex>
        </Flex>
    );
}