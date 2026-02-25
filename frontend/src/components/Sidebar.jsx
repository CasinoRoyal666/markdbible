import React from 'react';

const Sidebar = ({ notes, activeNoteId, onSelectNote, onAddNote }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">MdBible Notes</div>

            <div className="notes-list">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
                        onClick={() => onSelectNote(note.id)}
                    >
                        {note.title || "Untitled Note"}
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