import { NumberSign } from "../../Layout/Elements";
import { Flex } from "../../Layout/Layout";

export function CardValueChange({ num, baseNum = null, unit, text, className="flex-row-reverse md:flex-col gap-0 mr-0 m-0 py-1 md:py-0 items-start"}) {
    return (
        <Flex className={className}>
            {baseNum == null ? <div className="text-sm md:text-xs font-semibold">{num}</div> : <NumberSign num={num} className="text-sm md:text-xs font-semibold" baseNum={baseNum} unit={unit} />}
            <div className="text-sm mr-1 text-washed md:hidden">{`: `}</div>
            <div className="text-sm md:text-xs text-washed text-left">{text}</div>
        </Flex>
    );
}