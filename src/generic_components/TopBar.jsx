import Button from "../Layout/elements"
import { Flex } from "../Layout/Layout"
import { NetworkSelector } from "./NetworkSelector";

export const TopBar = () => {
    return (
        <Flex className="justify-between items-center w-full max-h-21 bg-primary py-4 p-2 md:p-4"> 
            <NetworkSelector />
            <Flex className="justify-end">
                <Button className="p-1 text-sm">Login</Button>
            </Flex>
        </Flex>
    );
}