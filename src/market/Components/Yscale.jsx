import { Box, Flex } from "../../Layout/Layout";

export function Yscale({ setYscale }) {
    return (
        <Box>
            <Flex column>
                <button onClick={()=>setYscale("LOG")}>LOG</button>
                <button onClick={()=>setYscale("LIN")}>LIN</button>
            </Flex>
        </Box>
    )
}