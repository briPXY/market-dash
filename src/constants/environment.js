// global/window related codes

export const DOMAIN = import.meta.env.VITE_DOMAIN ?? "";
export const WSS_DOMAIN = import.meta.env.VITE_WSS_DOMAIN ?? "";

export const isAgentMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// custom errors

export class MissingAPIKeyError extends Error {
    constructor(message = "API Key not found. Please check your settings.") {
        super(message);
        this.name = "AuthenticationError";
        this.code = "MISSING_API_KEY";
    }
}