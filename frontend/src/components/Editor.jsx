import React from 'react';

const Editor = ({ activeNote, onUpdateNote }) => {
    if (!activeNote) {
        return <div className="editor-pane"><div className="no-active-note">Select a note to edit</div></div>;
    }

    const onEditField = (field, value) => {
        onUpdateNote({
            ...activeNote,
            [field]: value,
        });
    };

    return (
        <div className="editor-pane" key={activeNote.id}>
            <input
                type="text"
                className="title-input"
                value={activeNote.title}
                placeholder="Note Title"
                onChange={(e) => onEditField("title", e.target.value)}
                autoFocus
            />

            <textarea
                className="markdown-input"
                value={activeNote.content}
                placeholder="Write your markdown here..."
                onChange={(e) => onEditField("content", e.target.value)}
            />
        </div>
    );
};

export default Editor;