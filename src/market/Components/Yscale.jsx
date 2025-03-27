import Button from "../../Layout/elements";
import {Flex } from "../../Layout/Layout";

export function Yscale({ setYscale }) {
    return (
        <Flex className="flex-col items-start bg-secondary p-2 text-sm w-max rounded-md">
            <Button onClick={() => setYscale("LOG")}>logical scale</Button>
            <Button onClick={() => setYscale("LIN")}>linear scale</Button>
        </Flex>
    )
}