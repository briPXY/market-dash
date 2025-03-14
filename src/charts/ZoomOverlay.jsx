import { Flex } from "../Layout/Layout";

export const ZoomOverlay = ({ setLengthPerItem }) => {
    return (
        <Flex className="gap-0.5">
            <div className="bg-secondary w-6 cursor-pointer text-lg" onClick={() => setLengthPerItem(w => w + 1)}>+</div>
            <div className="bg-secondary w-6 cursor-pointer text-lg" onClick={() => setLengthPerItem(w => w - 1)}>-</div>
        </Flex>
    );
}