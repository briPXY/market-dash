import { CopyIcon } from "../../Layout/svg";
import { SourceConst } from "../../constants/sourceConst"
import { Flex, SvgMemo } from "../../Layout/Layout"

export const PoolAddressView = ({ src, address }) => {
    if (!address || !src || !SourceConst[src].isDex) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <Flex className="text-[12px] md:text-xs text-washed items-center font-light">
            <div className="max-w-[4rem] font-mono md:max-w-19 truncate">{address}</div>
            <button title="Copy Pool Address" onClick={copyToClipboard} className="text-sm p-0" >
                <SvgMemo>
                    <CopyIcon className="text-washed w-4"/>
                </SvgMemo>
            </button>
        </Flex>
    )
}