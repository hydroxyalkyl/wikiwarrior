import {createContext, ReactNode, useEffect, useMemo, useState} from "react";

type Settings = Record<string, unknown>;

interface SettingsContextType {
    settingsData: Settings;
    updateSettingsData: (settings: Settings) => void;
}

const DEFAULT_SETTINGS: Settings = {
    darkMode: true,
    fullscreenModals: false,
    startClipsWithSound: true,
    autoplayClips: false,
    showPillsInTable: true,
};

export const SettingsContext = createContext<SettingsContextType>({
    settingsData: DEFAULT_SETTINGS,
    updateSettingsData: () => void 0,
});

function SettingsProvider({ children }: { children: ReactNode}) {
    const [settingsData, setSettingsData] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const savedSettings = localStorage.getItem("settingsData");

        if (savedSettings) {
            setSettingsData(prevSettings => ({
                ...prevSettings,
                ...JSON.parse(savedSettings)
            }));
        }

        document.documentElement.setAttribute("data-bs-theme", settingsData.darkMode ? "dark" : "light");
    }, [settingsData.darkMode]);

    // Function to update settings and persist them to localStorage
    const updateSettingsData = (updatedSettings: Settings) => {
        setSettingsData((prevSettings) => {
            const newSettings = {...prevSettings, ...updatedSettings};
            localStorage.setItem("settingsData", JSON.stringify(newSettings));
            return newSettings;
        });
    };

    const settingsValue = useMemo(() => ({ settingsData, updateSettingsData }), [settingsData]);

    return (
        <SettingsContext.Provider value={settingsValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsProvider;