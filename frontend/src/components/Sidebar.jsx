import React, {useMemo, useState} from 'react';
import { useNavigate } from "react-router-dom";

const NoteItem = ({ note, level = 0, activeNoteId, onSelectNote, onDeleteNote })  => {
    return (
        <div
            className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
            onClick={() => onSelectNote(note.id)}
            style={{ marginLeft: `${level * 15}px` }}
        >
            <div>
                <div className="note-title">
                    📄 {note.title || "Untitled Note"}
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
                title="Delete Note"
            >
                ×
            </button>
        </div>
    );
};

const FolderTree = ({folder, level = 0, folders, notes, activeNoteId, onSelectNote, onAddNote,
onAddFolder, onDeleteNote, onDeleteFolder, onRenameFolder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);

    //look for the folder content
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
            {/* the folder itself */}
            <div
                className="folder-item"
                style={{
                    marginLeft: `${level * 15}px`,
                    display: "flex",
                    justifyContent: 'space-between',
                    padding: '5px',
                    cursor: 'pointer',
                    color: '#ccc',
                    borderRadius: '4px'
                }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#37373d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor ='transparent'}
            >
                <div
                    style={{ fontWeight: '500' }}
                    onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                >
                    {isOpen ? '📂' : '📁'}{' '}
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={handleRenameKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e1e1e',
                                border: '1px solid #78a9ff',
                                color: 'white',
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

                {/* Folder management buttons (add note/folder inside) */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={(e) => {e.stopPropagation(); onAddNote(null, folder.id); setIsOpen(true); }}
                        style={{ background: 'transparent', border: 'none', color: '#78a9ff', cursor: 'pointer', padding: '0 5px' }}
                        title="Add note here"
                        >+📄</button>
                    <button
                        onClick={(e) => {e.stopPropagation(); onAddFolder(folder.id); setIsOpen(true) }}
                        style={{ background: 'transparent', border: 'none', color: '#ffbdf2', cursor: 'pointer', padding: '0 5px' }}
                        title="Add subfolder"
                        >+📁</button>
                    <button
                        onClick={(e) => {e.stopPropagation(); onDeleteFolder(folder.id); }}
                        style={{ background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer', padding: '0 5px' }}
                        title="Delete folder"
                    >×</button>
                </div>
            </div>
            {/* If the folder is open, recursively draw its children */}
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
                        />
            ))}
                    {/* if folder is empty */}
                    {childFolders.length === 0 && childNotes.length === 0 && (
                        <div style={{ marginLeft: `${(level + 1) * 15}px`, color: '#666', fontSize: '0.8rem', padding: '5px' }}>
                            Empty folder
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const Sidebar = ({ notes, folders =[], activeNoteId, onSelectNote, onAddNote, onAddFolder, onDeleteNote, onDeleteFolder, onRenameFolder, onOpenGraph, searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "User";
    const [selectedTag, setSelectedTag] = useState(null);
    const[isTagsOpen, setIsTagsOpen] = useState(false);

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // collect unique tags
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

    const commonStyle = { width: '100%', padding: '8px', marginBottom: '10px', background: '#1e1e1e', border: '1px solid #3e3e42', color: 'white', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' };

    // looking if the user is currently searching for something
    const isSearching = searchTerm.trim() !== "" || selectedTag !== null;

    // looking for ROOT elements (those that are NOT in folders, parent/folder === null)
    const rootFolders = folders.filter(f => f.parent === null);
    const rootNotes = notes.filter(n => n.folders === null);

    return (
        <div className="sidebar">
            <div className="sidebar-header">MkBible
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    Logged in as: <span style={{ color: '#78a9ff' }}>{username}</span>
                </div>
            </div>

            {/* search */}
            <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={commonStyle}
            />

            {/* tag cloud */}
            {uniqueTags.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div
                        onClick={() => setIsTagsOpen(!isTagsOpen)}
                        style={{ fontSize: '0.8rem', color: '#888', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}
                    >
                        <span>Tags ({uniqueTags.length})</span>
                        <span>{isTagsOpen ? '▲' : '▼'}</span>
                    </div>

                    {isTagsOpen && (
                        <div className="tags-cloud">
                            <span
                                className={`tag-pill ${searchTerm === "" ? 'selected' : ''}`}
                                onClick={() => setSearchTerm("")}
                            >
                                All
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

            {/* graph button */}
            <button
                onClick={onOpenGraph}
                style={{ ...commonStyle, background: '#2d2d30', color: '#aaa', cursor: 'pointer', marginBottom: '15px' }}
            >
                🕸 Open Graph View
            </button>

            {/* list (tree or search) */}
            <div className="notes-list" style={{ flex: 1, overflowY: 'auto' }}>

                {isSearching ? (
                    /* search (flat  list) */
                    <>
                        <div style={{ padding: '5px', fontSize: '0.8rem', color: '#666' }}>Search results:</div>
                        {filteredNotes.map((note) => (
                            <NoteItem
                                key={`search-note-${note.id}`}
                                note={note}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onDeleteNote={onDeleteNote}
                            />
                        ))}
                        {filteredNotes.length === 0 && (
                            <div style={{ color: '#668', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                                No notes found
                            </div>
                        )}
                    </>
                ) : (
                    /* folder tree (default view) */
                    <>
                        {/* render root folders firstly */}
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
                            />
                        ))}

                        {/*  render the root notes secondly */}
                        {rootNotes.map(note => (
                            <NoteItem
                                key={`root-note-${note.id}`}
                                note={note}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onDeleteNote={onDeleteNote}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* control buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #3e3e42', display: 'flex', gap: '5px' }}>
                <button
                    className="add-btn"
                    onClick={() => onAddFolder(null)}
                    style={{ flex: 1, background: '#3e3e42', color: '#ffbdf2' }}
                    title="New Folder"
                >
                    + 📁
                </button>
                <button
                    className="add-btn"
                    onClick={() => onAddNote(null, null)}
                    style={{ flex: 1 }}
                    title="New Note"
                >
                    + 📄
                </button>
                <button
                    onClick={onLogout}
                    style={{ padding: '10px', background: '#3e3e42', border: 'none', color: '#ff5555', borderRadius: '4px', cursor: 'pointer' }}
                    title="Logout"
                >
                    Exit
                </button>
            </div>
        </div>
    );
};

export default Sidebar;