import React from 'react';

const Sidebar = ({ notes, activeNoteId, onSelectNote, onAddNote, onDeleteNote, onOpenGraph }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">MkBible</div>

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
            <div className="notes-list">
                {notes.map((note) => (
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
            </div>

            <button className="add-btn" onClick={onAddNote}>
                + New Note
            </button>
        </div>
    );
};

export default Sidebar;