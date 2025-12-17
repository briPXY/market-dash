import { useEffect, useState } from "react";
import { openLink } from "../utils/utils";
import { useWalletStore } from "../stores/stores";
import { deleteUserSecret, encryptAndSaveUserSecret } from "../utils/user";
import { isSavedStateExist } from "../idb/stateDB";

export function FormTextUserSecret({ keyName, validator = async (secret) => secret, onAddSuccess = () => { } }) {
    const getCensoredText = (x = 24) => '•'.repeat(x);
    const [secretSubmitted, setSecretSubmitted] = useState(false);
    const [secretString, setSecretString] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const walletAddress = useWalletStore(state => state.address);

    const subGraphSetHandler = async () => {
        try {
            setLoading(true);
            await validator(secretString);
            const saved = await encryptAndSaveUserSecret(keyName, secretString, walletAddress, useWalletStore.getState().signature, useWalletStore.getState().message);
            setSecretSubmitted(true);
            setStatus(saved);
            setLoading(false);
            onAddSuccess();
        } catch (e) {
            setStatus(e.message);
            setLoading(false);
        }
    };

    const deleteAPIKey = async () => {
        try {
            await deleteUserSecret(keyName, walletAddress);
            setSecretSubmitted(false);
        } catch (e) {
            setStatus(e.message);
        }
    };

    useEffect(() => {
        walletAddress ? setStatus(null) : setStatus("Not logged-in");

        isSavedStateExist(`${keyName}_${walletAddress}`).then(isSaved => {
            isSaved ? setSecretSubmitted(true) : setSecretSubmitted(false);
        });

    }, [keyName, walletAddress]);

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="text-left text-sm font-semibold">{keyName}</div>
                {secretSubmitted && <div className="ml-2 text-xs rounded-sm px-1 font-semibold border bg-accent text-primary-900">Saved</div>}
                {status && <div className="text-sm text-washed"><i>{status}</i></div>}
            </div>
            <input
                type="text"
                disabled={secretSubmitted}
                value={secretSubmitted ? getCensoredText(36) : secretString}
                onChange={(e) => setSecretString(e.target.value)}
                placeholder={secretSubmitted ? getCensoredText(36) : `Your ${keyName} here`}
                className="rounded-sm text-sm border border-primary-100 p-2 mt-2 w-full"
                style={{ background: secretSubmitted ? "var(--color-primary-500" : "var(--color-primary-900)" }}

            />
            <div className="flex text-xs font-semibold text-washed gap-1.5 w-full mt-3">
                {secretSubmitted && <button className="px-2 bg-washed text-primary-900 py-1.5 rounded-sm" onClick={() => deleteAPIKey()}>{loading ? "Loading..." : `Delete ${keyName}`}</button>}
                {!secretSubmitted && <button className="px-2 bg-washed text-primary-900 py-1.5 rounded-sm" onClick={() => subGraphSetHandler()}>{loading ? "Loading..." : `Save ${keyName}`}</button>}
                {!secretSubmitted && <button className="px-2 border border-primary-100 py-1.5 rounded-sm" onClick={() => openLink("https://thegraph.com/studio/apikeys/")}>{`Get ${keyName}`}</button>}
            </div>
        </>
    )

}