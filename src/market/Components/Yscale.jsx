import Button from "../../Layout/Elements";
import {Flex } from "../../Layout/Layout";

export function Yscale({ setYscale }) {
    return (
        <Flex className="flex-col items-start bg-primary-500 p-2 text-sm w-min rounded-md">
            <Button onClick={() => setYscale("LOG")}>Logical</Button>
            <Button onClick={() => setYscale("LIN")}>Linear</Button>
        </Flex>
    )
}