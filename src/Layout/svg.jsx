export const svg = {
    Swap({ fill = "#ffffff", color = "#ffffff" }) {
        return (
            <svg width="20px" height="20px" viewBox="0 3 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg" color={color}><path d="M19.4834 5.71191C19.0879 5.29883 18.4727 5.30762 18.0859 5.71191L13.6562 10.2471C13.4805 10.4229 13.3662 10.6953 13.3662 10.9326C13.3662 11.4863 13.7529 11.8643 14.2979 11.8643C14.5615 11.8643 14.7725 11.7764 14.9482 11.5918L16.7588 9.71094L17.9189 8.375L17.8486 10.2383L17.8486 21.6465C17.8486 22.1914 18.2441 22.5869 18.7891 22.5869C19.334 22.5869 19.7207 22.1914 19.7207 21.6465L19.7207 10.2383L19.6592 8.375L20.8105 9.71094L22.6211 11.5918C22.7969 11.7764 23.0166 11.8643 23.2803 11.8643C23.8164 11.8643 24.2031 11.4863 24.2031 10.9326C24.2031 10.6953 24.0889 10.4229 23.9131 10.2471L19.4834 5.71191ZM7.84668 22.2793C8.24218 22.6924 8.85742 22.6836 9.24414 22.2793L13.6738 17.7529C13.8496 17.5684 13.9639 17.2959 13.9639 17.0586C13.9639 16.5137 13.5771 16.1357 13.0322 16.1357C12.7773 16.1357 12.5576 16.2236 12.3818 16.3994L10.5713 18.2803L9.41992 19.6162L9.48144 17.7529L9.48144 6.34473C9.48144 5.80859 9.08594 5.4043 8.54101 5.4043C8.00488 5.4043 7.60937 5.80859 7.60937 6.34473L7.60937 17.7529L7.6709 19.6162L6.51953 18.2803L4.70898 16.3994C4.5332 16.2236 4.31347 16.1357 4.05859 16.1357C3.51367 16.1357 3.12695 16.5137 3.12695 17.0586C3.12695 17.2959 3.24121 17.5684 3.41699 17.7529L7.84668 22.2793Z" fill="currentColor"></path></svg>
        );
    },

    LoadingIcon({ className, style, fill = "#fff" }) {
        return (
            <svg
                className={className}
                style={style}
                version="1.1"
                id="L9"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 10 100 100"
            >
                <rect x="20" y="50" width="2" height="14" fill={fill}>
                    <animateTransform
                        attributeType="XML"
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 10; 0 0"
                        begin="0s"
                        dur="1.6s"
                        repeatCount="indefinite"
                    />
                </rect>
                <rect x="30" y="50" width="2" height="14" fill={fill}>
                    <animateTransform
                        attributeType="XML"
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 10; 0 0"
                        begin="0.5s"
                        dur="1.6s"
                        repeatCount="indefinite"
                    />
                </rect>
                <rect x="40" y="50" width="2" height="14" fill={fill}>
                    <animateTransform
                        attributeType="XML"
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 10; 0 0"
                        begin="1s"
                        dur="1.6s"
                        repeatCount="indefinite"
                    />
                </rect>
            </svg>
        );
    },
    SomethingElse() {
        return (
            <svg></svg>
        );
    },
};