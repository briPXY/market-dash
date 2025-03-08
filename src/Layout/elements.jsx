
import React, { useEffect, useRef, useState } from 'react';
import './elements.css';

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
    return (
        <button className={`btn btn-${variant} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Link = ({ children, variant = "b", className = '', ...props }) => {
    return (
        <a className={`link-${variant} ${className}`} {...props}>
            {children}
        </a>
    );
};

const DetectView = ({ children, height, className, visibleClass, invisibleClass, reachBottomClass, start }) => {
    const componentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [onBottom, setOnBottom] = useState(false);
    const invisible = onBottom && reachBottomClass ? reachBottomClass : invisibleClass;

    useEffect(() => {
        const handleScroll = () => {
            if (componentRef.current) {
                const viewStart = start ? start : componentRef.current.offsetTop;
                const divHeight = height ? height : componentRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const scrollY = window.scrollY;
                const viewportCenter = scrollY + viewportHeight / 2;
                const isInDiv = viewportCenter >= viewStart && viewportCenter <= viewStart + divHeight;

                setIsVisible(isInDiv);

                viewportCenter < viewStart ? setOnBottom(false) : true;
                viewportCenter > divHeight ? setOnBottom(true) : false;
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll); // Important: Add resize listener

        // Initial check on mount
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [height, start]);

    return (
        <div className={className} ref={componentRef}>
            {React.cloneElement(children, { className: isVisible ? visibleClass : invisible })}
        </div>
    )
};

const textStyles = {
    h1: "text-4xl md:text-5xl lg:text-6xl font-bold",
    h2: "text-3xl md:text-4xl lg:text-5xl font-semibold",
    h3: "text-2xl md:text-3xl lg:text-4xl font-semibold",
    h4: "text-xl md:text-2xl lg:text-3xl font-medium",
    h5: "text-lg md:text-xl lg:text-2xl font-medium",
    h6: "text-base md:text-lg lg:text-xl font-medium",
    p: "text-base md:text-lg text-gray-700",
    small: "text-sm md:text-base text-gray-500",
};

const Text = ({ as = "p", className = "", children }) => {
    const Component = as;
    return <Component className={`${textStyles[as]} ${className}`.trim()}>{children}</Component>;
};

export { Link, DetectView, Text };
export default Button;