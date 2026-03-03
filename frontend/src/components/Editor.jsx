import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown'

const Editor = ({ activeNote, onUpdateNote }) => {
    const [isPreview, setIsPreview] = useState(false);

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
            <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <input
                type="text"
                className="title-input"
                value={activeNote.title}
                placeholder="Note Title"
                onChange={(e) => onEditField("title", e.target.value)}
                autoFocus
                style={{ marginBottom: 0 }}
            />
            <button
                onClick={() => setIsPreview(!isPreview)}
                style={{
                    background: '',
                    color: 'white',
                    border: 'none',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                {isPreview ? 'Edit' : 'Preview'}
            </button>
            </div>
            {/* Display Logic*/}
            {isPreview ? (
                //markdown mode
                <div className="markdown-preview" style={{ padding: '10px', lineHeight: '1.6' }}>
                    <ReactMarkdown>
                        {activeNote.content}
                    </ReactMarkdown>
                </div>
            ) : (
                //redactor mode
                <textarea
                    className="markdown-input"
                    value={activeNote.content}
                    placeholder="Write your markdown here..."
                    onChange={(e) => onEditField("content", e.target.value)}
                    />
            )}
        </div>
    );
};

export default Editor;