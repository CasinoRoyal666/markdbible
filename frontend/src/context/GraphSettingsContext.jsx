import { createContext, useContext, useState, useCallback, useMemo } from "react";

const DEFAULT_SETTINGS = {
    nodeScale: 1.0,
    colorMode: 'folder',
    nodeColorSingle: '#5c7de0',
    showLabels: true,
    labelFontSize: 14,
    linkWidth: 1.5,
    showArrows: true,
    animateLinks: false,
};

export const PRESETS = {
    default: {
        nodeScale: 1.0,
        colorMode: 'folder',
        showLabels: true,
        labelFontSize: 14,
        linkWidth: 1.5,
        showArrows: true,
        animateLinks: false,
    },
    compact: {
        nodeScale: 0.7,
        colorMode: 'folder',
        showLabels: false,
        labelFontSize: 14,
        linkWidth: 1.2,
        showArrows: false,
        animateLinks: false,
    },
    exploration: {
        nodeScale: 1.3,
        colorMode: 'connectedness',
        showLabels: true,
        labelFontSize: 16,
        linkWidth: 2.0,
        showArrows: true,
        animateLinks: true,
    },
};

function detectPreset(settings) {
    for (const [name, values] of Object.entries(PRESETS)) {
        if (Object.keys(values).every(k => settings[k] === values[k])) {
            return name;
        }
    }
    return 'custom';
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('graphSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch { /* ignore corrupt localStorage */ }
    return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
    localStorage.setItem('graphSettings', JSON.stringify(settings));
}

const GraphSettingsContext = createContext(null);

export function GraphSettingsProvider({ children }) {
    const [settings, setSettingsRaw] = useState(loadSettings);
    const [activePreset, setActivePreset] = useState(() => detectPreset(settings));

    const updateSetting = useCallback((key, value) => {
        setSettingsRaw(prev => {
            const next = { ...prev, [key]: value };
            saveSettings(next);
            setActivePreset(detectPreset(next));
            return next;
        });
    }, []);

    const applyPreset = useCallback((presetName) => {
        const presetValues = PRESETS[presetName];
        if (!presetValues) return;
        const next = { ...settings, ...presetValues };
        setSettingsRaw(next);
        setActivePreset(presetName);
        saveSettings(next);
    }, [settings]);

    const resetSettings = useCallback(() => {
        const next = { ...DEFAULT_SETTINGS };
        setSettingsRaw(next);
        setActivePreset('default');
        saveSettings(next);
    }, []);

    const value = useMemo(() => ({
        settings,
        activePreset,
        updateSetting,
        applyPreset,
        resetSettings,
    }), [settings, activePreset, updateSetting, applyPreset, resetSettings]);

    return (
        <GraphSettingsContext.Provider value={value}>
            {children}
        </GraphSettingsContext.Provider>
    );
}

export function useGraphSettings() {
    const ctx = useContext(GraphSettingsContext);
    if (!ctx) {
        throw new Error('useGraphSettings must be used within GraphSettingsProvider');
    }
    return ctx;
}
