
import { timeFrameText } from "../../constants/constants";
import { SourceConst } from "../../constants/sourceConst";
import { Box, BulletText, Flex } from "../../Layout/Layout";
import { useSourceStore } from "../../stores/stores";

export function IndicatorList({ setIndicator }) {
    return (
        <Box>
            <Flex>
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

export function RangeSelector({ setRange, selected }) {
    const source = useSourceStore(state => state.src);

    if (!source) {
        return null;
    }

    const timeframes = SourceConst[source].intervals;

    return (
        <div className="flex">
            {timeframes.map((tf) => (
                <button
                    key={tf}
                    onClick={() => setRange(tf)}
                    className={`px-1.5 md:px-2 py-0.5 rounded-sm text-xs transition-all ${selected === tf ? "text-primary font-bold bg-primary-300 " : "font-light text-washed hover:brightness-120"}`}
                >
                    {timeFrameText[tf]}
                </button>
            ))}
        </div>
    );
}
