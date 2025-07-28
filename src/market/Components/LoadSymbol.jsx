import { usePoolStore } from "../../stores/stores";
import { svg } from "../../Layout/svg";

export const LoadSymbol = () => {
    const { init } = usePoolStore();
    const symbolUndefined = {
        true: { zIndex: "999" },
        false: { display: "none" },
        null: { display: "none" },
    }

    return (
        <div className="bg-secondary floating-modal" style={symbolUndefined[init]}>
            <div className="flex items-center rounded-lg pr-2 pl-8">
                <div className="text-xs md:text-sm">Loading pools information</div>
                <svg.LoadingIcon className="w-12 h-12" />
            </div>
        </div>
    )
}