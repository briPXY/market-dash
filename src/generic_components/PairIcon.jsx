import { memo } from "react";
import { TokenIcon } from "@web3icons/react/dynamic"; // adjust import if needed
import { stdSymbol } from "../utils/utils";
import { usePriceInvertStore } from "../stores/stores";

const PairIcon = ({
    symbol0,
    symbol1,
    variant = "background",
    className0 = "rounded-full",
    className1 = "rounded-full",
    size = 30,
    spacing = "-0.5rem",
    style0 = {},
    style1 = {},
    className = "flex justify-center items-center",
    ...rest
}) => {
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    return (
        <div className={className} {...rest}>
            <div style={style0} >
                <TokenIcon
                    symbol={stdSymbol(invertedStatus ? symbol1 : symbol0).toLowerCase()}
                    size={size}
                    variant={variant}
                    className={className0}
                    fallback={"/icon-fallback.jpg"}
                />
            </div>
            <div style={{ marginLeft: spacing, ...style1 }} >
                <TokenIcon
                    symbol={stdSymbol(invertedStatus ? symbol0 : symbol1).toLowerCase()}
                    size={size}
                    variant={variant}
                    className={className1}
                    fallback={"/icon-fallback.jpg"}
                />
            </div>
        </div>
    );
};


export default memo(PairIcon);
