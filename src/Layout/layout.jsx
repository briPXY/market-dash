
import { useEffect } from "react";
import PropTypes from 'prop-types';
import { useRef } from "react";
import { useState } from "react";
import './layout.css';

const FlexHug = ({ column, wrap, style = {}, className = "", children, ...props }) => {
    return (
        <div
            className={`flex-flex items-start justify-start ${className}`}
            style={{
                display: "inline-flex",
                flexDirection: column ? "column" : "row",
                borderRadius: "var(--border-radius)",
                boxSizing: "border-box",
                flexWrap: wrap ? "wrap" : "nowrap",
                background: "var(--panel-color)",
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const Flex = ({ column, wrap, className = '', style = {}, wide, children, ...props }) => {
    const flexDirection = column ? "flex-col" : "flex-row";

    return (
        <div
            className={`flex-flex ${flexDirection} ${wide ? 'f-wide' : ''} ${className}`}
            style={{
                flexWrap: wrap,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const FlexCC = ({ column, wrap, className = '', style = {}, wide, children, ...props }) => {

    const flexDirection = column ? "flex-col" : "flex-row";

    return (
        <div
            className={`flex-flex ${flexDirection} justify-center items-center ${wide ? 'f-wide' : ''} ${className}`}
            style={{
                flexWrap: wrap,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const FlexBC = ({ column, wrap, className = '', style = {}, wide, children, ...props }) => {
    const flexDirection = column ? "flex-col" : "flex-row";

    return (
        <div
            className={`flex-flex ${flexDirection} ${wide ? 'f-wide' : ''} justify-between items-center  ${className}`}
            style={{
                flexWrap: wrap,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const FlexSC = ({ column, wrap, className = '', style = {}, wide, children, ...props }) => {
    const flexDirection = column ? "flex-col" : "flex-row";

    return (
        <div
            className={`flex-flex ${flexDirection} ${wide ? 'f-wide' : ''} justify-start items-center  ${className}`}
            style={{
                flexWrap: wrap,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const Section = ({ children, style = {}, className = "", ...props }) => {
    return (
        <section
            className={`section-s  p-[var(--padding)] ${className}`}
            style={style}
            {...props}
        >
            {children}
        </section>
    );
};

const BoxStretch = ({ className, style = {}, children, ...props }) => {
    return (
        <div
            className={`border-[none] w-100 h-100 p-[var(--padding)] ${className}`}
            style={{
                borderRadius: "var(--border-radius)",
                boxSizing: "border-box",
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};


const Grid = ({ columns, column, row = 'auto', gap = '0', hug = false, style = {}, children, ...props }) => {
    // Determine the grid template columns
    const gridTemplateColumns = column ? column : `repeat(${columns}, 1fr)`;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: row,
                gap: gap,
                width: hug ? 'fit-content' : '100%',
                height: hug ? 'fit-content' : '100%',
                boxSizing: 'border-box',
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const Line = ({ thickness = '1px', style = {}, ...props }) => {
    return (
        <hr
            style={{
                border: 'none',
                width: "100%",
                borderTop: `${thickness} solid var(--line-color)`,
                ...style,
            }}
            {...props}
        />
    );
};

const SectionFull = ({ height = '100svh', style = {}, children, ...props }) => {
    // Ensure the height prop is a valid percentage string or '100svh'
    const isPercentage = /^(\d{1,2}|100)%$/.test(height);
    const computedHeight = isPercentage ? `calc(${height} * 1svh)` : height;

    return (
        <section
            style={{
                width: '100%',
                height: computedHeight,
                boxSizing: 'border-box',
                ...style,
            }}
            {...props}
        >
            {children}
        </section>
    );
};

const Textbox = ({ fontSize = '16px', lineHeight = '1.5', p, style = {}, ...props }) => {
    const st = {
        fontSize,
        lineHeight,
        borderRadius: "var(--border-radius)",
        padding: p ? p : "var(--padding)",
        width: '100%',
        boxSizing: 'border-box',
        ...style,
    };

    return <input type="text" style={st} {...props} />;
};

const Paragraph = ({ fontSize = 'var(--text-normal)', lineHeight = '1.5', p, style = {}, children, ...props }) => {
    const st = {
        fontSize,
        lineHeight,
        borderRadius: 'var(--border-radius)',
        padding: p ? p : "var(--padding)",
        boxSizing: 'border-box',
        ...style,
    };

    return (
        <p style={st} {...props}>
            {children}
        </p>
    );
};


const DisplayText = ({ children, variant = "normal", style = {}, className, ...props }) => {
    const displayStyle = {
        fontFamily: 'var(--display-family, sans-serif)',
        lineHeight: 'var(--display-height)',
        color: 'var(--display-txt-color)',
        ...style,
    };

    return (
        <div className={`display-text-${variant} ${className}`} style={displayStyle} {...props}>
            {children}
        </div>
    );
};


const Box = ({ children, className, ...props }) => {

    return (
        <div className={`panel ${className}`} {...props}>
            {children}
        </div>
    );
};
 

const StackedImages = ({ images, className = '', style = {}, align = 'center', children, ...props }) => {
    return (
        <div
            className={`stacked-images justify-center ${className}`}
            style={{
                alignItems: align,
                ...style
            }}
            {...props}
        >
            {images.map(([size, src, top = "50%", left = "50%"], index) => (
                <img
                    key={index}
                    src={src}
                    alt={`stacked-${index}`}
                    style={{
                        position: 'absolute',
                        top: `${top}`,
                        left: `${left}`,
                        transform: 'translate(-50%, -50%)',
                        width: `${size}`, // Size as percentage of container
                        height: 'auto', // Maintain aspect ratio
                        objectFit: 'contain',
                    }}
                />
            ))}
            {children}
        </div>
    );
};

StackedImages.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])) // [percentage, url]
    ).isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
};

const BulletText = ({ img, imgDim, children, className = '', textClass = {}, style = {}, ...props }) => {
    return (
        <div
            className={`bullet-text ${className}`}
            style={{ ...style }}
            {...props}
        >
            {img && (
                <img
                    src={img}
                    alt="bullet"
                    style={{
                        height: imgDim ? imgDim : `1em`, // Matches text height
                        width: imgDim ? imgDim : '1em', // Keeps aspect ratio
                        objectFit: 'contain'
                    }}
                />
            )}
            <span className={`${textClass}`}>{children}</span>
        </div>
    );
};

BulletText.propTypes = {
    img: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
};

const PopoverButton = ({ children, className = '', btnClass, contentClass }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={popoverRef} style={{ position: "relative", display: "inline-block" }} className={`${className}`}>
            {/* Button */}
            <div onClick={() => setIsOpen(!isOpen)} className={`${btnClass}`}>
                {children[0]}
            </div>

            {/* Popover Content */}
            {isOpen && (
                <div className={`absolute top-full left-0 shadow-md ${contentClass}`} style={{ zIndex: "9" }}>
                    {children[1]}
                </div>
            )}
        </div>
    );
};



export { Flex, Section, BoxStretch, Grid, Line, SectionFull, Textbox, DisplayText, Paragraph, FlexBC, FlexCC, FlexSC, Box, StackedImages, BulletText, PopoverButton };
export default FlexHug;