

import PropTypes from 'prop-types';
import './layout.css';
import React, { useState, memo } from "react";

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

const Flex = ({ wrap, className = '', style = {}, wide, children, ...props }) => {
    return (
        <div
            className={`flex ${wide ? 'f-wide' : ''} ${className}`}
            style={{
                flexWrap: wrap ? "wrap" : "nowrap",
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
            className={`section-s mb-1 ${className}`}
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
            className={`border-[none] w-100 h-100 p-(--padding) ${className}`}
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

export function TabPanelParent({ children, className = "w-full bg-primary-900 max-w-md mx-auto", tabClassName = "flex-1 py-2 text-sm font-medium ", activeTabClassName = "bg-primary-100 border-primary", inactiveTabClassName = "bg-primary-500 hover:bg-primary-900", btnContainerClassName = "flex w-full space-x-2", childrensClassName = "w-full h-full", activeDisplay = "block", style = {} }) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className={className} style={style}>
            <div className={btnContainerClassName}>
                {React.Children.map(children, (child, index) => (
                    <button
                        onClick={() => setActiveTab(index)}
                        className={`${tabClassName} ${activeTab === index ? activeTabClassName : inactiveTabClassName}`}
                    >
                        {child.props.label || `Tab ${index + 1}`}
                    </button>
                ))}
            </div>
            <>
                {React.Children.map(children, (child, index) => (
                    <div key={index} style={{ display: activeTab === index ? activeDisplay : "none" }} className={childrensClassName}>
                        {child}
                    </div>
                ))}
            </>
        </div>
    );
}

const SvgMemo = memo(
    ({
        children
    }) => {
        if (!children) return null;

        const Child = children.type;
        return <Child  {...children.props} />;
    }
);


SvgMemo.displayName = "SvgMemo";

export { Flex, Section, BoxStretch, Grid, Line, SectionFull, Textbox, Paragraph, FlexBC, FlexCC, FlexSC, Box, StackedImages, BulletText, SvgMemo };
export default FlexHug;