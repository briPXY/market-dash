
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
    
    if (!source){
        return null;
    }

    const timeframes = SourceConst[source].intervals;
 
    return (
        <div className="flex space-x-2">
            {timeframes.map((tf) => (
                <button
                    key={tf}
                    onClick={() => setRange(tf)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all
                        ${
                            selected === tf
                                ? "text-[var(--acc-01)]" // Increase brightness when selected
                                : "hover:brightness-110"
                        }`}
                >
                    {tf.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
