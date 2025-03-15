import { Flex } from "../Layout/Layout";

export const ZoomOverlay = ({ setLengthPerItem }) => {
    return (
        <Flex className="gap-2">
            <div className="cursor-pointer text-base" onClick={() => setLengthPerItem(w => w + 1)}>+</div>
            <div className="cursor-pointer text-base" onClick={() => setLengthPerItem(w => w - 1)}>-</div>
        </Flex>
    );
}