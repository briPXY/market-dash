export const DOMAIN = import.meta.env.VITE_DOMAIN ?? "";
export const WSS_DOMAIN = import.meta.env.VITE_WSS_DOMAIN ?? "";

export const isAgentMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);