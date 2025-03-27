import Button from "../Layout/elements"
import { Flex } from "../Layout/Layout"
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = () => {
    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary p-4"> 
            <div className="min-w-35 text-xs md:inline-block hidden">DEX Swap and Scanner</div>
            <NetworkSelector />
            <Flex className="min-w-35 justify-end">
                <Button>Login</Button>
            </Flex>
        </Flex>
    );
}