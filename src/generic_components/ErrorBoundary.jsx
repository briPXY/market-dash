import React from 'react';
import { DialogBalloon } from './DialogBalloon';

// Assuming DialogBalloon is imported or defined elsewhere
// import DialogBalloon from './DialogBalloon'; 

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });   // <-- important
        console.error("Error Boundary Caught:", error, errorInfo);
    }

    // Reset UI without full reload
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    // FULL APP RESTART (best for corrupted React tree)
    restartApp = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <DialogBalloon
                    isOpen={true}
                    title="Error occurred"
                    message={`${this.state.error?.toString()}\n${this.state.errorInfo?.componentStack}`}
                    primaryButtonText='Try Again'
                    onPrimaryClick={this.resetError}
                    secondaryButtonText='Restart App'
                    onSecondaryClick={this.restartApp}
                />
            );
        }

        return this.props.children;
    }
}
