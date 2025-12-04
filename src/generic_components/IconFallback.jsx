import { useState } from 'react';

export const IconFallback = ({ src, size = 64, alt = "Image", className = '' }) => {
    // State to track if the image has failed to load
    const [hasError, setHasError] = useState(false);

    // Styles for the image and fallback container
    const style = {
        width: `${size}px`,
        height: `${size}px`,
    };

    // --- Fallback JSX ---
    if (hasError) {
        return (
            <div
                style={style}
                className={`
          ${className} 
          bg-gray-300 
          text-gray-600 
          flex 
          items-center 
          justify-center   
        `}
                title={`Image load failed for: ${src}`}
            >
            </div>
        );
    }

    // --- Image JSX ---
    return (
        <img
            src={src}
            alt={alt}
            style={style}
            className={`${className} object-cover `}
            // The onError event handler is triggered if the image fails to load
            onError={() => {
                console.error(`Failed to load image at: ${src}`);
                setHasError(true);
            }}
        />
    );
};
