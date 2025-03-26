import Button from "../Layout/elements"
import { Flex } from "../Layout/Layout"
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = () => {
    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary p-4"> 
            <div className="text-xs md:inline-block hidden">DEX Swap and Price Tracking</div>
            <NetworkSelector />
            <Flex>
                <Button>Login</Button>
            </Flex>
        </Flex>
    );
}