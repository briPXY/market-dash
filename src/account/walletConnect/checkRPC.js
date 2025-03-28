export async function checkRpcStatus(rpcUrl) {
    try {
        const response = await fetch(rpcUrl, {
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
            console.log(`✅ RPC is online. Latest block: ${parseInt(data.result, 16)}`);
            return true;
        } else {
            throw new Error("No block data received");
        }
    } catch (error) {
        console.error(`❌ RPC is down: ${error.message}`);
        return false;
    }
}
 