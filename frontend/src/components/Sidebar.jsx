import React, {useMemo, useState} from 'react';
import { useNavigate } from "react-router-dom";

const Sidebar = ({ notes, activeNoteId, onSelectNote, onAddNote, onDeleteNote, onOpenGraph, searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    // const [searchTerm, setSearchTerm] = useState("");
    const username = localStorage.getItem("username") || "User";
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagsOpen, setIsTagsOpen] = useState(false);

    const commonStyle = {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        background: '#1e1e1e',
        border: '1px solid #3e3e42',
        color: 'white',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '14px'
    };

    const buttonStyle = {
        ...commonStyle,
        background: '#2d2d30',
        color: '#aaa',
        cursor: 'pointer',
        marginBottom: '15px'
    };

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    //useMemo needed for not to recalculate it with every keystroke, but only when notes change
    const uniqueTags = useMemo(() => {
        const tags = new Set();
        notes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => tags.add(tag.name));
            }
        });
        return Array.from(tags).sort();
    }, [notes]);

    const filteredNotes = notes.filter(note => {
        const term = searchTerm.toLowerCase();
        //tags logic - if search starts with "#" symbol
        if (term.startsWith('#')) {
            //clean "#" to search clean name
            const tagToFind = term.slice(1);
            //if note dont have tags -> skip
            if (!note.tags) return false;

            return note.tags.some(t => t.name.toLowerCase().includes(tagToFind));
        }
        // search by title
        return note.title.toLowerCase().includes(term);
    });

    // tag click function in the cloud
    const handleTagCloudClick = (tag) => {
        if (searchTerm === `#${tag}`) {
            setSearchTerm("");
        } else {
            setSearchTerm(`#${tag}`);
        }
    };


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
                        style={{
                            fontSize: '0.8rem',
                            color: '#888',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0 5px'
                        }}
                    >
                        <span>Tags ({uniqueTags.length})</span>
                        <span>{isTagsOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* show tag clod only if opened */}
                    {isTagsOpen && (
                        <div className="tags-cloud">
                            <span
                                className={`tag-pill ${selectedTag === null ? 'selected' : ''}`}
                                onClick={() => setSelectedTag(null)}
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
                style={buttonStyle}
                >
                Open Graph View
            </button>

            {/* notes list */}
            <div className="notes-list">
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
                        onClick={() => onSelectNote(note.id)}
                    >
                        <div className="note-title">
                            {note.title || "Untitled Note"}
                        </div>

                        {/* tags inside note card */}
                        {note.tags && note.tags.length > 0 && (
                            <div className="note-tags-row">
                                {note.tags.slice(0, 3).map(tag => (
                                    <span key={tag.id} className="mini-tag">#{tag.name}</span>
                                ))}
                                {note.tags.length > 3 && (
                                    <span className="mini-tag" style={{color: '#666'}}>+{note.tags.length - 3}</span>
                                )}
                            </div>
                        )}

                        <button
                            className="delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                {filteredNotes.length === 0 && (
                    <div style={{ color: '#668', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                        No notes found
                    </div>
                    )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #3e3e42', display: 'flex', gap: '10px' }}>
            <button className="add-btn" onClick={onAddNote}>
                + New Note
            </button>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '10px',
                        background: '#3e3e42',
                        border: 'none',
                        color: '#ff5555',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    title="Logout"
                >
                    Exit
                </button>
            </div>
        </div>
    );
};

export default Sidebar;