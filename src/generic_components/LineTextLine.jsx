/**
 * A component to display text centered between two horizontal lines.
 * Example: ---- Text Content ----
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The text content to display between the lines.
 */
const LineTextLine = ({ children }) => {
    return (
        <div className="flex items-center w-full my-4">
            {/* Left Line */}
            <div className="flex-grow border-t border-washed-dim h-0"
                style={{ borderTopWidth: '1px' }}>
            </div>

            {/* Text Content */}
            <span className="flex-shrink-0 mx-2 text-washed text-sm">
                {children}
            </span>

            {/* Right Line */}
            <div className="flex-grow border-t border-washed-dim h-0"
                style={{ borderTopWidth: '1px' }}>
            </div>
        </div>
    );
};

export default LineTextLine;