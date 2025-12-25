// global/window related codes

export const DOMAIN = import.meta.env.VITE_DOMAIN ?? "";
export const WSS_DOMAIN = import.meta.env.VITE_WSS_DOMAIN ?? "";

export const isAgentMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const Cacheds = {
    etherProvider: null,
    sepoliaProvider: null,
};

// custom errors 
export class MissingAPIKeyError extends Error {
    constructor(message = "API Key not found. Please check your settings.") {
        super(message);
        this.name = "AuthenticationError";
        this.code = "MISSING_API_KEY";
    }
}

export class ErrorNoRPC extends Error {
    constructor(message = "Required RPC not found. Please check your settings.") {
        super(message);
        this.name = "HttpFetchError";
        this.code = "MISSING_RPC";
    }
}