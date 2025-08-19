import { CopyIcon } from "../../Layout/svg";
import { SourceConst } from "../../constants/sourceConst"
import { Flex, SvgMemo } from "../../Layout/Layout"

export const PoolAddressView = ({ src, address }) => {
    if (!address || !src || !SourceConst[src].isDex) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <Flex className="text-[12px] md:text-xs text-washed gap-0.5 items-center font-light">
            <div className="max-w-[4rem] font-mono md:max-w-19 truncate">{address}</div>
            <button title="Copy Address" onClick={copyToClipboard} className="text-sm p-0" >
                <SvgMemo>
                    <CopyIcon />
                </SvgMemo>
            </button>
        </Flex>
    )
}