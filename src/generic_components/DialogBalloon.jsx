import { useCallback } from 'react';
import { ModalOverlay } from './ModalOverlay';

export const DialogBalloon = ({
    isOpen,
    onClose,
    title,
    message,
    primaryButtonText = 'Confirm',
    secondaryButtonText = 'Cancel',
    onPrimaryClick,
    onSecondaryClick,
}) => {
    const handlePrimaryClick = useCallback(() => {
        onPrimaryClick?.();
        onClose();
    }, [onPrimaryClick, onClose]);

    const handleSecondaryClick = useCallback(() => {
        onSecondaryClick?.();
        onClose();
    }, [onSecondaryClick, onClose]);

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4 p-4 rounded-lg bg-primary-900 min-w-70">
                {/* Header */}
                {title && (
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-white">
                            {title}
                        </h2>
                    </div>
                )}

                {/* Message/Content */}
                {message && (
                    <div className="my-4">
                        <p className="text-washed text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                )}

                {/* Button Container */}
                <div className="flex gap-3 justify-center pt-4 text-sm border-washed-dim">
                    {/* Primary Button */}
                    <button
                        onClick={handlePrimaryClick}
                        className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700"
                        aria-label={primaryButtonText}
                    >
                        {primaryButtonText}
                    </button>
                    {/* Secondary Button */}
                    <button
                        onClick={handleSecondaryClick}
                        className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-washed bg-primary-500 hover:bg-primary-600 active:bg-primary-700"
                        aria-label={secondaryButtonText}
                    >
                        {secondaryButtonText}
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};
