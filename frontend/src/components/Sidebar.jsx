import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";

const Sidebar = ({ notes, activeNoteId, onSelectNote, onAddNote, onDeleteNote, onOpenGraph }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const username = localStorage.getItem("username") || "User";

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                style={{
                    width: '100%',
                    marginBottom: '15px',
                    padding: '8px',
                    background: '#1e1e1e',
                    border: '1px solid #3e3e42',
                    color: 'white',
                    borderRadius: '4px'
                }}
            />

            {/* graph button */}
            <button
                onClick={onOpenGraph}
                style={{
                    width: '100%',
                    marginBottom: '15px',
                    padding: '8px',
                    background: '#2d2d30',
                    color: '#aaa',
                    border: '1px solid #3e3e42',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
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