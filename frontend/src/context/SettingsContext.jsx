import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    });

    const [editorFontSize, setEditorFontSize] = useState(() => {
        return localStorage.getItem('editorFontSize') || '1.1';
    });

    const [noteSort, setNoteSort] = useState(() => {
        return localStorage.getItem('noteSort') || 'newest';
    });

    const [confirmDelete, setConfirmDelete] = useState(() => {
        return localStorage.getItem('confirmDelete') !== 'false';
    });

    const [autosaveDelay, setAutosaveDelay] = useState(() => {
        const saved = localStorage.getItem('autosaveDelay');
        return (saved === '500' || saved === '1000') ? saved : '500';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('editorFontSize', editorFontSize);
    }, [editorFontSize]);

    useEffect(() => {
        localStorage.setItem('noteSort', noteSort);
    }, [noteSort]);

    useEffect(() => {
        localStorage.setItem('confirmDelete', String(confirmDelete));
    }, [confirmDelete]);

    useEffect(() => {
        localStorage.setItem('autosaveDelay', autosaveDelay);
    }, [autosaveDelay]);

    const toggleTheme = () => setTheme(t => {
        if (t === 'dark') return 'light';
        if (t === 'light') return 'codex';
        return 'dark';
    });
    const toggleLanguage = () => setLanguage(l => l === 'en' ? 'ru' : 'en');
    const toggleConfirmDelete = () => setConfirmDelete(v => !v);

    return (
        <SettingsContext.Provider value={{
            language, theme, setTheme, toggleTheme, toggleLanguage,
            editorFontSize, setEditorFontSize,
            noteSort, setNoteSort,
            confirmDelete, toggleConfirmDelete,
            autosaveDelay, setAutosaveDelay,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
