import { CopyIcon } from "../../Layout/svg";
import { SourceConst } from "../../constants/sourceConst"
import { Flex, SvgMemo } from "../../Layout/Layout"
import { usePoolStore } from "../../stores/stores";

export const PoolAddressView = ({ src }) => {
    const address = usePoolStore(state => state.address);
    if (!address || !src || !SourceConst[src].isDex) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <Flex className="text-[12px] md:text-xs text-washed items-center font-light">
            <div className="max-w-16 font-mono md:max-w-19 truncate">{address}</div>
            <button title="Copy Pool Address" onClick={copyToClipboard} className="text-sm p-0" >
                <SvgMemo>
                    <CopyIcon className="text-washed w-4" />
                </SvgMemo>
            </button>
        </Flex>
    )
}