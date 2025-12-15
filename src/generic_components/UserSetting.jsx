import { TabPanelParent } from "../Layout/Layout";
import { useModalVisibilityStore } from "../stores/stores";
import { ModalOverlay } from "./ModalOverlay";
import { FormSubgraphAPIKey } from "./SettingForms";

export function UserSetting() {
    const visibility = useModalVisibilityStore(state => state.userSetting);

    return (
        <ModalOverlay isOpen={visibility} closeFn={() => useModalVisibilityStore.getState().setModalVisibility("userSetting", false)}>
            <div className="w-full md:w-300 rounded-lg p-4 bg-primary-900">
                <div className="font-semibold pb-4 text-lg">User Settings</div>
                <TabPanelParent
                    className="flex h-[77vh] mx-auto overflow-scroll"
                    btnContainerClassName="w-[20%] h-full border border-primary-100 rounded-md p-3"
                    tabClassName="w-full p-2 text-sm"
                    activeTabClassName="bg-primary-100 rounded-md"
                >
                    <UserSettingAPIKeys label="API Keys" />
                </TabPanelParent>
            </div>
        </ModalOverlay>
    );
}

function UserSettingAPIKeys() {

    return (
        <div className="mx-3">
            {/* Subgraph API */}
            <div className="border border-primary-100 rounded-md p-4">
                <FormSubgraphAPIKey />
            </div>
        </div>
    )
}



