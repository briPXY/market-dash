import { useEffect, useMemo, useState } from "react";
import { DOMAIN } from "../constants/environment";
import { openLink } from "../utils/utils";
import { useWalletStore } from "../stores/stores";

export function FormSubgraphAPIKey() {
    const getCensoredText = (x = 24) => '•'.repeat(x);
    const [subgraphSubmitted, setSubgraphSubmitted] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const walletAddress = useWalletStore(state => state.address);
    const requiredWalletInfo = useMemo(() => ({
        walletAddress: walletAddress,
        signature: useWalletStore.getState().signature,
        message: useWalletStore.getState().message,
    }), [walletAddress])

    const subGraphSetHandler = () => {
        setLoading(true);
        fetch(`${DOMAIN}/user/evm-wallet/submit-subgraph-key`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...requiredWalletInfo, apiKey: apiKey })
        }).then(async (res) => {
            if (!res.ok) {
                return res.json().then(errorData => {
                    const error = new Error("Bad Request from Server");
                    error.status = res.status;
                    error.data = errorData;
                    throw error;
                });
            }
            return res.json();
        }).then(data => {
            console.log(data)
            if (data.success) {
                setStatus("Subraph API key succesfully saved");
                setSubgraphSubmitted(true);
            }
        }).catch(e => {
            setSubgraphSubmitted(false);
            setStatus(e.data.message ?? "Error when saving API key");
            console.error(e);
        }).finally(() => setLoading(false));
    }

    const deleteAPIKey = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${DOMAIN}/user/evm-wallet/delete-saved-key`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...requiredWalletInfo, keyName: "subgraph_api_key" })
            });
            if (!res.ok) {
                setLoading(false);
                setSubgraphSubmitted(false)
                setStatus("Failed at deleting key");
            }
            const data = await res.json();
            if (data.deleted) {
                setSubgraphSubmitted(false);
                setLoading(false);
                setStatus("Key sucesfully deleted");
            }
        } catch (e) {
            setLoading(false);
            setStatus(e.message);
        }
    };

    useEffect(() => {
        if (!walletAddress) return;

        const requiredWalletInfo = {
            walletAddress: walletAddress,
            signature: useWalletStore.getState().signature,
            message: useWalletStore.getState().message,
        };
        requiredWalletInfo.keyName = "subgraph_api_key";

        fetch(`${DOMAIN}/user/evm-wallet/check-saved-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Essential header for sending JSON
            },
            body: JSON.stringify(requiredWalletInfo)
        })
            .then(res => res.json())
            .then(data => {
                if (data.saved) {
                    setSubgraphSubmitted(true);
                }
            })
            .catch(e => e ? setSubgraphSubmitted(false) : e);
    }, [walletAddress]);

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="text-left text-sm font-semibold">Subgraph API Key</div>
                {subgraphSubmitted && <div className="ml-2 text-xs rounded-sm px-1 font-semibold border bg-accent text-primary-900">Saved</div>}
                {status && <div className="text-sm text-washed"><i>{status}</i></div>}
            </div>
            <input
                type="text"
                disabled={subgraphSubmitted}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={subgraphSubmitted ? getCensoredText(36) : "Enter your Subgraph API Key"}
                className="rounded-sm border border-primary-100 bg-primary-500 p-2 mt-2 w-full"
            />
            <div className="flex text-xs font-semibold text-washed gap-1.5 w-full mt-3">
                {subgraphSubmitted && <button className="px-2 bg-washed text-primary-900 py-1.5 rounded-sm" onClick={() => deleteAPIKey()}>{loading ? "Loading..." : "Delete API Key"}</button>}
                {!subgraphSubmitted && <button className="px-2 bg-washed text-primary-900 py-1.5 rounded-sm" onClick={() => subGraphSetHandler()}>{loading ? "Loading..." : "Save API Key"}</button>}
                {!subgraphSubmitted && <button className="px-2 border border-primary-100 py-1.5 rounded-sm" onClick={() => openLink("https://thegraph.com/studio/apikeys/")}>Get Subgraph API Key</button>}
            </div>
        </>
    )

}