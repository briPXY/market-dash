import { NumberSign } from "../../Layout/Elements";
import { Flex } from "../../Layout/Layout";

export function CardValueChange({ num, baseNum = null, unit, text }) {
    return (
        <Flex className="flex-col gap-0 m-0 p-0 items-start">
            {baseNum == null ? <div className="md:text-sm text-xs">{num}</div> : <NumberSign num={num} className="md:text-sm text-xs" baseNum={baseNum} unit={unit} />}
            <div className="text-[12px] text-washed text-left">{text}</div>
        </Flex>
    );
}