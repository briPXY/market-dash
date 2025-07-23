import { SourceConst } from "../../constants/sourceConst"
import Button from "../../Layout/Elements"
import { Flex } from "../../Layout/Layout"

export const PoolAddressView = ({ src, address }) => {
    if (!address || !src || !SourceConst[src].isDex) return null; 

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <Flex className="text-xs text-washed gap-1 items-center font-normal">
            <div>Pool:</div>
            <div className="max-w-[5rem] md:max-w-19 truncate">{address}</div>
            <Button onClick={copyToClipboard} className="text-[11px]" >copy</Button>
        </Flex>
    )
}