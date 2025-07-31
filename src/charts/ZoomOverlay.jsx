import { Flex } from "../Layout/Layout";

export const ZoomOverlay = ({ setLengthPerItem }) => {
    return (
        <Flex className="gap-0.5">
            <div className="cursor-pointer text-base bg-primary-500 h-6 w-6 rounded-sm hover:brightness-125" onClick={() => setLengthPerItem(w => w + 1)}>+</div>
            <div className="cursor-pointer text-base bg-primary-500 h-6 w-6 rounded-sm hover:brightness-125" onClick={() => setLengthPerItem(w => w - 1)}>-</div>
        </Flex>
    );
}