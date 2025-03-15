import {Flex } from "../../Layout/Layout";

export function Yscale({ setYscale }) {
    return (
        <Flex className="flex-col">
            <button onClick={() => setYscale("LOG")}>LOG</button>
            <button onClick={() => setYscale("LIN")}>LIN</button>
        </Flex>
    )
}