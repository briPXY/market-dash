export async function getAvailableRPC(rpcUrls) {
    for (let i = 0; i < rpcUrls.length; i++) {
        const url = rpcUrls[i];
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_blockNumber",
                    params: []
                }),
            });

            if (!response.ok) {
                throw new Error(`RPC returned status ${response.status}`);
            }

            const data = await response.json();
            if (data.result) {
                console.log(`✅ Working RPC: ${url}`);
                return url;
            } else {
                throw new Error("No block data received");
            }
        } catch (error) {
            console.warn(`❌ RPC failed [${url}]: ${error.message}`);
            // Continue to next URL
        }
    }

    // All RPCs failed
    console.error("⚠️ All RPC URLs failed.");
    throw new Error("⚠️ All RPC URLs failed.");
}


export const RPC_URLS = {};

RPC_URLS.UniswapV3 = [
    // 🔝 Highly reliable public RPCs
    "https://rpc.ankr.com/eth",              // Very stable, widely used
    "https://ethereum.publicnode.com",       // Fast, reliable public RPC
    "https://eth.llamarpc.com",              // Solid fallback, community-backed

    // 🧪 Less battle-tested or newer
    "https://rpc.payload.de/eth",            // Community maintained, Germany-based
    "https://ethereum.blockpi.network/v1/rpc/public", // Public offering by BlockPI
    "https://rpc.flashbots.net",             // MEV-aware RPC, may not always be ideal for general use

    // 🧾 Extra fallbacks (less stable or slower)
    "https://1rpc.io/eth",                   // Free, decent for low-volume
    "https://cloudflare-eth.com"             // Operated by Cloudflare, can be slow or down
];