import React, { useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
import SettingsModal from './SettingsModal.jsx';
import { FileText, Trash2, Folder, FolderOpen, FilePlus, FolderPlus, Network, Settings } from 'lucide-react';

const NoteItem = ({ note, level = 0, activeNoteId, onSelectNote, onDeleteNote, t }) => {
    return (
        <div
            className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
            onClick={() => onSelectNote(note.id)}
            style={{ marginLeft: `${level * 15}px` }}
        >
            <div>
                <div className="note-title">
                    <FileText size={14} style={{ flexShrink: 0 }} /> {note.title || "Untitled Note"}
                </div>
                {note.tags && note.tags.length > 0 && (
                    <div className="note-tags-row">
                        {note.tags.slice(0, 3).map(tag => (
                            <span key={tag.id} className="mini-tag">#{tag.name}</span>
                        ))}
                    </div>
                )}
            </div>
            <button
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                }}
                title={t.deleteNote}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};
const FolderTree = ({ folder, level = 0, folders, notes, activeNoteId, onSelectNote, onAddNote,
                        onAddFolder, onDeleteNote, onDeleteFolder, onRenameFolder, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);
    const childFolders = folders.filter(f => f.parent === folder.id);
    const childNotes = notes.filter(n => n.folders === folder.id);
    const handleRenameSubmit = () => {
        const trimmed = editName.trim();
        if (trimmed && trimmed !== folder.name) {
            onRenameFolder(folder.id, trimmed);
        } else {
            setEditName(folder.name);
        }
        setIsEditing(false);
    };
    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') {
            setEditName(folder.name);
            setIsEditing(false);
        }
    };
    return (
        <div>
            <div
                className="folder-item"
                style={{
                    marginLeft: `${level * 15}px`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px',
                    cursor: 'pointer',
                    color: 'var(--text-color)',
                    borderRadius: '4px'
                }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <div
                    style={{ fontWeight: '500' }}
                    onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                >
                    {isOpen ? <FolderOpen size={14} /> : <Folder size={14} />}{' '}
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={handleRenameKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--accent-color)',
                                color: 'var(--text-color)',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                fontSize: 'inherit',
                                outline: 'none',
                                width: '130px'
                            }}
                        />
                    ) : (
                        folder.name
                    )}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddNote(null, folder.id); setIsOpen(true); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: '0 5px' }}
                        title={t.addNoteHere}
                    ><FilePlus size={14} /></button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddFolder(folder.id); setIsOpen(true); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-folder)', cursor: 'pointer', padding: '0 5px' }}
                        title={t.addSubfolder}
                    ><FolderPlus size={14} /></button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '0 5px' }}
                        title={t.deleteFolder}
                    ><FolderPlus size={14} /></button>
                </div>
            </div>
            {isOpen && (
                <div>
                    {childFolders.map(childFolder => (
                        <FolderTree
                            key={`folder-${childFolder.id}`}
                            folder={childFolder}
                            level={level + 1}
                            folders={folders}
                            notes={notes}
                            activeNoteId={activeNoteId}
                            onSelectNote={onSelectNote}
                            onAddNote={onAddNote}
                            onAddFolder={onAddFolder}
                            onDeleteNote={onDeleteNote}
                            onDeleteFolder={onDeleteFolder}
                            onRenameFolder={onRenameFolder}
                            t={t}
                        />
                    ))}
                    {childNotes.map(childNote => (
                        <NoteItem
                            key={`note-${childNote.id}`}
                            note={childNote}
                            level={level + 1}
                            activeNoteId={activeNoteId}
                            onSelectNote={onSelectNote}
                            onDeleteNote={onDeleteNote}
                            t={t}
                        />
                    ))}
                    {childFolders.length === 0 && childNotes.length === 0 && (
                        <div style={{ marginLeft: `${(level + 1) * 15}px`, color: 'var(--text-faint)', fontSize: '0.8rem', padding: '5px' }}>
                            {t.emptyFolder}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
const Sidebar = ({ notes, folders = [], activeNoteId, onSelectNote, onAddNote, onAddFolder, onDeleteNote, onDeleteFolder, onRenameFolder, onOpenGraph, searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "User";
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { language } = useSettings();
    const t = translations[language];
    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };
    const uniqueTags = useMemo(() => {
        const tags = new Set();
        notes.forEach(note => {
            if (note.tags) note.tags.forEach(tag => tags.add(tag.name));
        });
        return Array.from(tags).sort();
    }, [notes]);
    const filteredNotes = notes.filter(note => {
        const term = searchTerm.toLowerCase();
        if (term.startsWith('#')) {
            const tagToFind = term.slice(1);
            if (!note.tags) return false;
            return note.tags.some(t => t.name.toLowerCase().includes(tagToFind));
        }
        return note.title.toLowerCase().includes(term);
    });
    const handleTagCloudClick = (tag) => {
        if (searchTerm === `#${tag}`) {
            setSearchTerm("");
        } else {
            setSearchTerm(`#${tag}`);
        }
    };
    const commonStyle = {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '14px'
    };
    const isSearching = searchTerm.trim() !== "" || selectedTag !== null;
    const rootFolders = folders.filter(f => f.parent === null);
    const rootNotes = notes.filter(n => n.folders === null);
    return (
        <>
        <div className="sidebar">
            <div className="sidebar-header">MkBible
                <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '5px' }}>
                    {t.loggedInAs}: <span style={{ color: 'var(--accent-color)' }}>{username}</span>
                </div>
            </div>
            <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={commonStyle}
            />
            {uniqueTags.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div
                        onClick={() => setIsTagsOpen(!isTagsOpen)}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}
                    >
                        <span>{t.tags} ({uniqueTags.length})</span>
                        <span>{isTagsOpen ? '▲' : '▼'}</span>
                    </div>
                    {isTagsOpen && (
                        <div className="tags-cloud">
                            <span
                                className={`tag-pill ${searchTerm === "" ? 'selected' : ''}`}
                                onClick={() => setSearchTerm("")}
                            >
                                {t.all}
                            </span>
                            {uniqueTags.map(tag => (
                                <span
                                    key={tag}
                                    className={`tag-pill ${searchTerm === `#${tag}` ? 'selected' : ''}`}
                                    onClick={() => handleTagCloudClick(tag)}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <button
                onClick={onOpenGraph}
                style={{ ...commonStyle, background: 'var(--panel-bg)', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '15px' }}
            >
                <Network size={14} /> {t.openGraphView}
            </button>
            <div className="notes-list" style={{ flex: 1, overflowY: 'auto' }}>
                {isSearching ? (
                    <>
                        <div style={{ padding: '5px', fontSize: '0.8rem', color: 'var(--text-faint)' }}>{t.searchResults}</div>
                        {filteredNotes.map((note) => (
                            <NoteItem
                                key={`search-note-${note.id}`}
                                note={note}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onDeleteNote={onDeleteNote}
                                t={t}
                            />
                        ))}
                        {filteredNotes.length === 0 && (
                            <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                                {t.noNotesFound}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {rootFolders.map(folder => (
                            <FolderTree
                                key={`folder-${folder.id}`}
                                folder={folder}
                                folders={folders}
                                notes={notes}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onAddNote={onAddNote}
                                onAddFolder={onAddFolder}
                                onDeleteNote={onDeleteNote}
                                onDeleteFolder={onDeleteFolder}
                                onRenameFolder={onRenameFolder}
                                t={t}
                            />
                        ))}
                        {rootNotes.map(note => (
                            <NoteItem
                                key={`root-note-${note.id}`}
                                note={note}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onDeleteNote={onDeleteNote}
                                t={t}
                            />
                        ))}
                    </>
                )}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '5px' }}>
                <button
                    className="add-btn"
                    onClick={() => onAddFolder(null)}
                    style={{ flex: 1, background: 'var(--border-color)', color: 'var(--accent-folder)' }}
                    title={t.newFolder}
                >
                    <FolderPlus size={15} />
                </button>
                <button
                    className="add-btn"
                    onClick={() => onAddNote(null, null)}
                    style={{ flex: 1 }}
                    title={t.newNote}
                >
                    <FilePlus size={15} />
                </button>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ padding: '10px', background: 'var(--border-color)', border: 'none', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
                    title={t.settingsTitle}
                >
                    <Settings size={16} />
                </button>
                <button
                    onClick={onLogout}
                    style={{ padding: '10px', background: 'var(--border-color)', border: 'none', color: 'var(--accent-danger)', borderRadius: '4px', cursor: 'pointer' }}
                    title={t.logout}
                >
                    {t.logout}
                </button>
            </div>
        </div>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};
export default Sidebar;