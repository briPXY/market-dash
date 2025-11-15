import { useCallback, useEffect, useState } from 'react';

export const ModalOverlay = ({ children, isOpen, onClose = () => { } }) => {
    const [openState, setOpenState] = useState(isOpen);
    // Handle clicks on the backdrop (the outer div)
    const handleCloseClick = useCallback((event) => {
        // Check if the click originated from the backdrop itself, not a child element
        if (event.target === event.currentTarget) {
            setOpenState(false);
            onClose();
        }
    }, [onClose]);

    useEffect(() => setOpenState(isOpen), [isOpen])

    if (!openState) {
        return null;
    }

    // Inline SVG for the 'X' close icon
    const CloseIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 6L6 18"></path>
            <path d="M6 6L18 18"></path>
        </svg>
    );

    return (
        // Backdrop: Fixed position, full screen, semi-transparent black
        // Flex utilities center the content horizontally and vertically
        <div
            className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4 transition-opacity duration-300" 
            aria-modal="true"
            role="dialog"
        >
            {/* Close Button positioned at the top-right corner of the overlay */}
            <button
                onClick={handleCloseClick}
                className="absolute top-4 right-4 p-2 text-black hover:text-gray-800 transition-colors duration-150 rounded-full bg-gray-300 hover:bg-gray-50 z-50"
                aria-label="Close modal"
            >
                {CloseIcon}
            </button>

            {
                /*
          Modal Container (The centered content area)
          We use max-w-lg and rounded-xl for aesthetics.
          The content inside is rendered via `children`.
        */
            }
            <div className="relative">
                {children}
            </div>
        </div>
    );
};