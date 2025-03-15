import { NumberSign } from "../../Layout/elements";
import { Flex } from "../../Layout/Layout";

export function CardValueChange({ num, baseNum = null, unit, text }) {
    return (
        <Flex className="flex-col gap-0 m-0 p-0 items-start">
            {baseNum == null ? <div className="text-base">{num}</div> : <NumberSign num={num} baseNum={baseNum} unit={unit} />}
            <div className="text-xs text-washed">{text}</div>
        </Flex>
    );
}