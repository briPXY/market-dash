import { useCallback } from 'react';

export const ModalOverlay = ({ children, isOpen, closeFn, justifyContent = "center", alignItems = "center" }) => { 
    const handleButtonClick = useCallback((event) => { 
        event.stopPropagation();
        if (closeFn) {
            closeFn();
        }
    }, [closeFn]);
 
    const handleBackdropClick = useCallback((event) => {
        // Only call closeFn if the click target is the backdrop div itself
        if (event.target === event.currentTarget && closeFn) {
            closeFn();
        }
    }, [closeFn]);

    // Inline SVG for the 'X' close icon
    const CloseIcon = ( 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" pointerEvents="none">
            <path d="M18 6L6 18"></path>
            <path d="M6 6L18 18"></path>
        </svg>
    );

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            onClick={handleBackdropClick}
            className="flex fixed inset-0 z-90 p-4 transition-opacity duration-400"
            aria-modal="true"
            role="dialog"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: "blur(3px)", justifyContent: justifyContent, alignItems: alignItems }}
        >
            <button 
                onClick={handleButtonClick}
                className="absolute top-4 right-4 p-2 text-black hover:text-gray-800 transition-all duration-500 rounded-full bg-gray-300 hover:bg-gray-50 z-90"
                aria-label="Close modal"
            >
                {CloseIcon}
            </button>
            {children}
        </div>
    );
};