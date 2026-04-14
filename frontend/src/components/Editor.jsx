import React, { useState, useRef, useEffect } from 'react';
import api from '../api.js';
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
import { Copy } from 'lucide-react';
const Editor = ({ activeNote, onUpdateNote, onTagClick, onWikiLinkClick }) => {
    const [isPreview, setIsPreview] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const sharePopoverRef = useRef(null);
    const { language } = useSettings();
    const t = translations[language];
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target)) {
                setIsShareOpen(false);
            }
        };
        if (isShareOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isShareOpen]);
    const handleTogglePublic = async () => {
        try {
            const response = await api.patch(`notes/${activeNote.id}/`, {
                is_public: !activeNote.is_public
            });
            onUpdateNote(response.data);
        } catch (error) {
            console.error("Error updating share status:", error);
        }
    };
    const handleCopyLink = () => {
        const link = `${window.location.origin}/shared/${activeNote.public_id}`;
        navigator.clipboard.writeText(link);
    };
    if (!activeNote) {
        return <div className="editor-pane"><div className="no-active-note">{t.selectNoteToEdit}</div></div>;
    }
    const onEditField = (field, value) => {
        onUpdateNote({ ...activeNote, [field]: value });
    };
    const uploadImageFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const MAX_SIZE_MB = 1.5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            alert(t.fileTooLarge(MAX_SIZE_MB));
            return;
        }
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post('images/', formData);
            const imageUrl = response.data.image;
            const imageMarkdown = `\n![Image](${imageUrl})\n`;
            const textarea = textareaRef.current;
            if (textarea) {
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                const textBefore = activeNote.content.substring(0, startPos);
                const textAfter = activeNote.content.substring(endPos, activeNote.content.length);
                onEditField("content", textBefore + imageMarkdown + textAfter);
            } else {
                onEditField("content", activeNote.content + imageMarkdown);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(t.failedToUpload);
        }
    };
    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        if (file) uploadImageFile(file);
        event.target.value = null;
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) uploadImageFile(file);
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    const handlePaste = (event) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = items[i].getAsFile();
                uploadImageFile(file);
                break;
            }
        }
    };
    return (
        <div className="editor-pane" key={activeNote.id}>
            <div className="editor-header">
                <input
                    type="text"
                    className="title-input"
                    value={activeNote.title}
                    placeholder={t.noteTitlePlaceholder}
                    onChange={(e) => onEditField("title", e.target.value)}
                    autoFocus
                    style={{ marginBottom: 0, flex: 1 }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                    />
                    {!isPreview && (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="editor-icon-btn"
                            title={t.uploadImage}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </button>
                    )}
                    <div style={{ position: 'relative' }} ref={sharePopoverRef}>
                        <button
                            onClick={() => setIsShareOpen(!isShareOpen)}
                            className={`editor-share-btn ${activeNote.is_public ? 'public' : ''}`}
                            title={t.shareNote}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            {t.shareNote}
                        </button>
                        {isShareOpen && (
                            <div className="share-popover">
                                <div className="share-popover-title">{t.shareNoteTitle}</div>
                                <div className="share-popover-row">
                                    <span className="share-popover-label">
                                        {activeNote.is_public ? t.public : t.private}
                                    </span>
                                    <div
                                        onClick={handleTogglePublic}
                                        className={`toggle-switch ${activeNote.is_public ? 'on' : ''}`}
                                    >
                                        <div className="toggle-thumb" />
                                    </div>
                                </div>
                                {activeNote.is_public && (
                                    <div className="share-link-row">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}/shared/${activeNote.public_id}`}
                                            className="share-link-input"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            title={t.copyLink}
                                            className="share-copy-btn"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="editor-preview-btn"
                    >
                        {isPreview ? t.edit : t.preview}
                    </button>
                </div>
            </div>
            {isPreview ? (
                <div className="markdown-preview">
                    <MarkdownRenderer
                        content={activeNote.content}
                        interactive={true}
                        onTagClick={onTagClick}
                        onWikiLinkClick={onWikiLinkClick}
                    />
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    className="markdown-input"
                    value={activeNote.content}
                    placeholder={t.writeMarkdown}
                    onChange={(e) => onEditField("content", e.target.value)}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onPaste={handlePaste}
                />
            )}
            {activeNote.backlinks && activeNote.backlinks.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-faint)', marginBottom: '10px' }}>{t.linkedToThisNote}</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {activeNote.backlinks.map(link => (
                            <span key={link.id} className="backlink-chip">
                                [[{link.title}]]
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;