import { memo } from "react";
import { TokenIcon } from "@web3icons/react/dynamic"; // adjust import if needed
import { stdSymbol } from "../utils/utils";

const PairIcon = ({
    symbol0,
    symbol1,
    variant = "background",
    className0 = "rounded-full",
    className1 = "rounded-full",
    size = 30,
    spacing = "-0.7rem",
    style0 = {},
    style1 = {},
    className = "flex justify-center items-center",
    ...rest
}) => {
    return (
        <div className={className} {...rest}>
            <div style={style0} >
                <TokenIcon
                    symbol={stdSymbol(symbol0 ?? "?").toLowerCase()}
                    size={size}
                    variant={variant}
                    className={className0}
                    fallback={"/icon-fallback.jpg"}
                />
            </div>
            <div style={{ marginLeft: spacing, ...style1 }} >
                <TokenIcon
                    symbol={stdSymbol(symbol1 ?? "?").toLowerCase()}
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
