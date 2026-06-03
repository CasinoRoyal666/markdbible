import React, { useState } from "react";
import { useSettings } from "../context/SettingsContext.jsx";
import { translations } from "../locales/translations.js";
import { useNavigate } from "react-router-dom";

const SettingsModal = ({ isOpen, onClose }) => {
    const {
        language, theme, toggleTheme, toggleLanguage,
        editorFontSize, setEditorFontSize,
        noteSort, setNoteSort,
        confirmDelete, toggleConfirmDelete,
        autosaveDelay, setAutosaveDelay,
    } = useSettings();
    const t = translations[language];
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                <h2 className="modal-title">{t.settingsTitle}</h2>

                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        {t.settingsTabGeneral}
                    </button>
                    <button
                        className={`modal-tab ${activeTab === 'editor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('editor')}
                    >
                        {t.settingsTabEditor}
                    </button>
                </div>

                {activeTab === 'general' && (
                    <div className="modal-tab-content">
                        <div className="setting-row">
                            <span className="setting-label">{t.languageLabel}</span>
                            <div className="toggle-switch" onClick={toggleLanguage}>
                                <div className={`toggle-thumb ${language === 'ru' ? 'right' : ''}`} />
                            </div>
                            <span className="toggle-label">
                                {language === 'en' ? t.langEnglish : t.langRussian}
                            </span>
                        </div>
                        <div className="setting-row">
                            <span className="setting-label">{t.themeLabel}</span>
                            <div className="toggle-switch" onClick={toggleTheme}>
                                <div className={`toggle-thumb ${theme === 'light' ? 'right' : ''}`} />
                            </div>
                            <span className="toggle-label">
                                {theme === 'dark' ? t.themeDark : t.themeLight}
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'editor' && (
                    <div className="modal-tab-content">
                        <div className="setting-row">
                            <span className="setting-label">
                                {t.editorFontSize}
                                <span className="setting-hint" data-tip={t.editorFontSizeHint}>i</span>
                            </span>
                            <div className="setting-range-group">
                                <input
                                    type="range"
                                    className="setting-range"
                                    min="0.9"
                                    max="1.5"
                                    step="0.1"
                                    value={editorFontSize}
                                    onChange={(e) => setEditorFontSize(e.target.value)}
                                />
                                <span className="setting-value">{editorFontSize}rem</span>
                            </div>
                        </div>
                        <div className="setting-row">
                            <span className="setting-label">{t.noteSort}</span>
                            <select
                                className="setting-select"
                                value={noteSort}
                                onChange={(e) => setNoteSort(e.target.value)}
                            >
                                <option value="newest">{t.sortNewest}</option>
                                <option value="oldest">{t.sortOldest}</option>
                                <option value="alpha">{t.sortAlpha}</option>
                                <option value="alpha-rev">{t.sortAlphaRev}</option>
                                <option value="updated">{t.sortUpdated}</option>
                            </select>
                        </div>
                        <div className="setting-row">
                            <span className="setting-label">
                                {t.autosaveDelay}
                                <span className="setting-hint" data-tip={t.autosaveDelayHint}>i</span>
                            </span>
                            <select
                                className="setting-select"
                                value={autosaveDelay}
                                onChange={(e) => setAutosaveDelay(e.target.value)}
                            >
                                <option value="500">500ms</option>
                                <option value="1000">1s</option>
                            </select>
                        </div>
                        <div className="setting-row">
                            <span className="setting-label">
                                {t.confirmDelete}
                                <span className="setting-hint" data-tip={t.confirmDeleteHint}>i</span>
                            </span>
                            <div className="toggle-switch" onClick={toggleConfirmDelete}>
                                <div className={`toggle-thumb ${confirmDelete ? 'right' : ''}`} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-separator" />
                <button className="modal-logout-btn" onClick={handleLogout}>
                    {t.logout}
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
