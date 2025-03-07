
import { Box, BulletText, Flex } from "../../Layout/Layout";

export function IndicatorList({ setIndicator }) {
    return (
        <Box>
            <Flex column>
                < BulletText>
                    <img alt="icon" /><div onClick={() => setIndicator(["SMA", "SMA10"])}>SMA10</div>
                </BulletText>
                < BulletText>
                    <img alt="icon" /><div onClick={() => setIndicator(["SMA", "SMA5"])}>SMA5</div>
                </BulletText>
            </Flex>
        </Box>
    )
}