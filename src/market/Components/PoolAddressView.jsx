import { SourceConst } from "../../constants/sourceConst"
import { PoolAddress } from "../../constants/uniswapAddress"
import Button from "../../Layout/elements"
import { Flex } from "../../Layout/Layout"

export const PoolAddressView = ({ src, symbolOut, symbolIn }) => {
    if (!SourceConst[src].isDex) return null;

    const address = PoolAddress[symbolOut][symbolIn];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <Flex className="text-xs text-washed gap-1 items-center">
            <div>Pool:</div>
            <div className="max-w-[7.5rem] truncate">{address}</div>
            <Button onClick={copyToClipboard} className="text-[11px]" >copy</Button>
        </Flex>
    )
}