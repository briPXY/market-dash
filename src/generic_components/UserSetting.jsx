import { useQueryClient } from "@tanstack/react-query";
import { TabPanelParent } from "../Layout/Layout";
import { useModalVisibilityStore } from "../stores/stores";
import { ModalOverlay } from "./ModalOverlay";
import { FormTextUserSecret } from "./SettingForms";

export function UserSetting() {
    const visibility = useModalVisibilityStore(state => state.userSetting);

    return (
        <ModalOverlay isOpen={visibility} closeFn={() => useModalVisibilityStore.getState().setModalVisibility("userSetting", false)}>
            <div className="w-full md:w-300 rounded-lg p-4 bg-primary-900 border border-washed-dim">
                <div className="font-semibold pb-4 text-lg">User Settings</div>
                <TabPanelParent
                    className="flex flex-col md:flex-row h-[77vh] mx-auto overflow-scroll"
                    btnContainerClassName="flex flex-wrap md:block md:w-[20%] md:h-full rounded-md p-3 md:p-0"
                    tabClassName="w-full md:text-left p-2 text-xs md:text-sm"
                    activeTabClassName="bg-primary-100 rounded-md"
                    inactiveTabClassName="bg-transparent"
                >
                    <UserSettingAPIKeys label="API Keys" />
                    <UserSettingCustomRPCs label="RPCs" />
                </TabPanelParent>
            </div>
        </ModalOverlay>
    );
}

function UserSettingAPIKeys() {
    const mainChartQuery = useQueryClient();
    const validateSubgraphApiKey = async (apiKey) => {
        const subgraphUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp`;
        const minimalQuery = `{ _meta { deployment } }`;

        try {
            const response = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: minimalQuery }),
            });

            const data = await response.json();

            if (response.ok && data?.data?._meta) {
                return true;
            }

            throw new Error(`Subgraph API key is invalid`);

        } catch (error) {
            throw new Error(`Subgraph API key is invalid. Reason: ${error}`);
        }
    }

    const HistoricalPriceAPISuccessHandler = () => {
        mainChartQuery.invalidateQueries({
            queryKey: ["mainchart"]
        });
    }

    return (
        <div className="mx-3 flex flex-col gap-4">
            {/* Subgraph API */}
            <div className="border bg-primary-500 border-primary-100 rounded-md p-4">
                <FormTextUserSecret keyName={"Subgraph API Key"} getLink={"https://thegraph.com/studio/apikeys/"} validator={validateSubgraphApiKey} onAddSuccess={HistoricalPriceAPISuccessHandler} />
            </div>
        </div>
    )
}

function UserSettingCustomRPCs() {
    const mainChartQuery = useQueryClient();
    const isValidRPC = async (url) => {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
                signal: AbortSignal.timeout(3000)
            });

            const data = await res.json();
            return res.ok && !!data.result;
        } catch {
            return false;
        }
    }

    const addSuccessHandler = () => {
        mainChartQuery.invalidateQueries({
            queryKey: ["mainchart"]
        });
    }

    return (
        <div className="mx-3 flex flex-col gap-6">
            <div className="border bg-primary-500 border-primary-100 rounded-md p-4">
                <FormTextUserSecret keyName={"Premium RPC"} validator={isValidRPC} onAddSuccess={addSuccessHandler} getLink={""} />
            </div>
            <div className="border bg-primary-500 border-primary-100 rounded-md p-4">
                <FormTextUserSecret keyName={"Sepolia RPC"} validator={isValidRPC} onAddSuccess={addSuccessHandler} getLink={""} />
            </div>
        </div>
    )
}




