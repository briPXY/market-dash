import { Flex } from "../Layout/Layout";

export const ZoomOverlay = ({ setLengthPerItem }) => {
    return (
        <Flex className="gap-0.5">
            <button className="text-washed text-base bg-primary-300 h-6 w-6 rounded-sm" onClick={() => setLengthPerItem(w => w + 1)}>+</button>
            <button className="text-washed text-base bg-primary-300 h-6 w-6 rounded-sm" onClick={() => setLengthPerItem(w => w - 1)}>-</button>
        </Flex>
    );
}