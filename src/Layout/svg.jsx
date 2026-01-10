import { memo } from 'react';

export const SwapIcon = ({ color = "#ffffff", className }) => {
    return (
        <svg className={className}
            width="20px"
            height="20px"
            viewBox="2 2 22 22"
            color={color}
            xmlns="http://www.w3.org/2000/svg"><path d="M19.4834 5.71191C19.0879 5.29883 18.4727 5.30762 18.0859 5.71191L13.6562 10.2471C13.4805 10.4229 13.3662 10.6953 13.3662 10.9326C13.3662 11.4863 13.7529 11.8643 14.2979 11.8643C14.5615 11.8643 14.7725 11.7764 14.9482 11.5918L16.7588 9.71094L17.9189 8.375L17.8486 10.2383L17.8486 21.6465C17.8486 22.1914 18.2441 22.5869 18.7891 22.5869C19.334 22.5869 19.7207 22.1914 19.7207 21.6465L19.7207 10.2383L19.6592 8.375L20.8105 9.71094L22.6211 11.5918C22.7969 11.7764 23.0166 11.8643 23.2803 11.8643C23.8164 11.8643 24.2031 11.4863 24.2031 10.9326C24.2031 10.6953 24.0889 10.4229 23.9131 10.2471L19.4834 5.71191ZM7.84668 22.2793C8.24218 22.6924 8.85742 22.6836 9.24414 22.2793L13.6738 17.7529C13.8496 17.5684 13.9639 17.2959 13.9639 17.0586C13.9639 16.5137 13.5771 16.1357 13.0322 16.1357C12.7773 16.1357 12.5576 16.2236 12.3818 16.3994L10.5713 18.2803L9.41992 19.6162L9.48144 17.7529L9.48144 6.34473C9.48144 5.80859 9.08594 5.4043 8.54101 5.4043C8.00488 5.4043 7.60937 5.80859 7.60937 6.34473L7.60937 17.7529L7.6709 19.6162L6.51953 18.2803L4.70898 16.3994C4.5332 16.2236 4.31347 16.1357 4.05859 16.1357C3.51367 16.1357 3.12695 16.5137 3.12695 17.0586C3.12695 17.2959 3.24121 17.5684 3.41699 17.7529L7.84668 22.2793Z" fill="currentColor"></path></svg>
    );
};

export const LoadingIcon = memo(({ className, style, fill = "#fff" }) => {
    return (
        <svg
            className={className}
            style={style}
            version="1.1"
            id="L9"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 19 19"
        >
            <rect x="0" y="0" width="3" height="14" fill={fill}>
                <animateTransform
                    attributeType="XML"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 5; 0 0"
                    begin="0s"
                    dur="1.6s"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x="7" y="0" width="3" height="14" fill={fill}>
                <animateTransform
                    attributeType="XML"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 5; 0 0"
                    begin="0.5s"
                    dur="1.6s"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x="14" y="0" width="3" height="14" fill={fill}>
                <animateTransform
                    attributeType="XML"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 5; 0 0"
                    begin="1s"
                    dur="1.6s"
                    repeatCount="indefinite"
                />
            </rect>
        </svg>
    );
});

LoadingIcon.displayName = 'LoadingIcon';

export const InlineCopyIcon = ({ className = "w-3 h-3 inline" }) => {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1" viewBox="2 2 13 13">
            <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" />
            <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" />
        </svg>
    );
};

export const SomethingElse = () => {
    return (
        <svg></svg>
    );
};

export const CopyIcon = ({ width = "19", height = "22", className, ...rest }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-8 -9 36 42"
            width={width}
            height={height}
            className={className}
            {...rest}
        >
            <g transform="matrix(1,0,0,1,-3,-3)">
                <rect fill="none" x="3" y="3" width="20" height="30" />
                <g transform="matrix(1,0,0,1,3,3)">
                    <g transform="matrix(1,0,0,1,16,16)">
                        <g transform="matrix(1,0,0,1,-4,-6.5)">
                            <path
                                d="M-11.25,-2C-11.25,-3.38 -10.15,-4.48 -8.8,-4.48H0.8C2.15,-4.48 3.25,-3.38 3.25,-2v12c0,1.35-1.1,2.45-2.45,2.45H-8.8c-1.35,0-2.45-1.1-2.45-2.45V-2Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="stroke-current"
                            />
                        </g>
                        <g transform="matrix(1,0,0,1,-4,-6.5)">
                            <path
                                d="M-7.25,-6C-7.25,-7.38 -6.15,-8.48 -4.8,-8.48H4.8C6.15,-8.48 7.25,-7.38 7.25,-6v12c0,1.35-1.1,2.45-2.45,2.45H-4.8c-1.35,0-2.45-1.1-2.45-2.45V-6Z"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="fill-current stroke-current"
                            />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export const ExternalLinkIcon = memo(({
    color = 'currentColor', // Default stroke color
    size = 24,       // Default size in pixels
    strokeWidth = 2, // Default stroke width
    className = '',  // Added className prop for Tailwind compatibility
    ...props         // Any additional SVG props
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24" // Standard 24x24 viewbox for common icon sizes
        fill="none"       // No fill for the icon
        stroke={color}    // Set stroke color based on props
        strokeWidth={strokeWidth} // Set stroke width based on props
        strokeLinecap="round"   // Rounded line caps
        strokeLinejoin="round"  // Rounded line joins
        className={`lucide lucide-external-link ${className}`} // Merging default and passed class names
        {...props} // Spread any additional props to the SVG element
    >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
    </svg>
));

// Adding a display name for better debugging in React DevTools
ExternalLinkIcon.displayName = 'ExternalLinkIcon';

function getColor(addr, index) {
    const clean = (addr || "").replace(/^0x/, "").padEnd(40, "0");
    return "#" + clean.slice(index * 6, index * 6 + 6);
}

function getBits(addr, count) {
    const clean = (addr || "").replace(/^0x/, "").padEnd(40, "0");
    let bits = [];
    for (let i = 0; i < count; i++) {
        const char = clean[i];
        const hexVal = parseInt(char, 16);
        bits.push(hexVal % 2 === 1); // odd hex chars = filled, even = empty
    }
    return bits;
}

export const BlockyAvatar = memo(function BlockyAvatar({
    address,
    size = 64,
    cells = 8,           // 8x8 block grid
    className
}) {
    const px = 100 / cells; // each cell size in viewBox units

    // create 4 colors from address (sliced)
    const colors = [
        getColor(address, 0),
        getColor(address, 1),
        getColor(address, 2),
        getColor(address, 3),
    ];

    // produce cells*cells booleans from address
    const bits = getBits(address, cells * cells);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* background */}
            <rect width="100" height="100" fill={colors[0]} />

            {bits.map((on, i) => {
                if (!on) return null;

                const x = i % cells;
                const y = Math.floor(i / cells);

                // choose one of 3 block colors based on the hex char index
                const fill = colors[(i % 3) + 1];

                return (
                    <rect
                        key={i}
                        x={x * px}
                        y={y * px}
                        width={px}
                        height={px}
                        fill={fill}
                    />
                );
            })}
        </svg>
    );
});

export const RefreshIcon = memo(({ size = 24, color, viewBox="3 3 18 18", ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            width={size}
            height={size}
            fill="currentColor" 
            style={{ color }}  
            {...props}
        >
            <title>Refresh Icon</title>
            <g>
                <path d="M21,12a9.0507,9.0507,0,1,1-3-6.68V3h2V8a1,1,0,0,1-1,1H14V7h2.8906A6.9942,6.9942,0,1,0,19,12Z" />
            </g>
        </svg>
    );
});

RefreshIcon.displayName = 'RefreshIcon';