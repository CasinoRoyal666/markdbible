import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown'
import api from '../api.js'

const Editor = ({ activeNote, onUpdateNote, onTagClick }) => {
    const [isPreview, setIsPreview] = useState(false);
    //link to a private input for choosing file
    const fileInputRef = useRef(null);
    //link to textarea to know where to insert text
    const textareaRef = useRef(null);

    if (!activeNote) {
        return <div className="editor-pane"><div className="no-active-note">Select a note to edit</div></div>;
    }

    const onEditField = (field, value) => {
        onUpdateNote({
            ...activeNote,
            [field]: value,
        });
    };
    console.log("Active Note Data:", activeNote);

    // upload image function
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        //create FormData object to send file
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('images/', formData);
            //django return full url for the image
            const imageUrl = response.data.image;
            //form markdown string
            const imageMarkdown = `\n![Image](${imageUrl})\n`;
            //paste to cursor location
            const textarea = textareaRef.current;
            if (textarea) {
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                const textBefore = activeNote.content.substring(0, startPos);
                const textAfter = activeNote.content.substring(endPos, activeNote.content.length);

                onEditField("content", textBefore + imageMarkdown +textAfter);
            } else {
                //if cursor not found then add to the end
                onEditField("content", activeNote.content + imageMarkdown);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Check server logs.");
        } finally {
            //clear input to upload same file one more time
            event.target.value = null;
        }
    }

    const LinkRenderer = (props) => {
        return (
            <a href={props.href} onClick={(e) => {
            }}>
                {props.children}
            </a>
        );
    };

    const components = {
        p: ({ children }) => {
            // children can be arrayed or empty string
            return (
                <p>
                    {React.Children.map(children, (child) => {
                        if (typeof child === 'string') {
                            // transform text into tags (like "Hello #world text" -> ["Hello ", "#world", " text"])
                            const parts = child.split(/(#\w+)/g);
                            return parts.map((part, index) => {
                                if (part.match(/^#\w+$/)) {
                                    return (
                                        <span
                                            key={index}
                                            className="obsidian-tag"
                                            onClick={() => onTagClick(part)}
                                        >
                                            {part}
                                        </span>
                                    );
                                }
                                return part;
                            });
                        }
                        return child;
                    })}
                </p>
            );
        },
        // pictures don't go beyond the screen
        img: ({ node, alt, src, title, ...props }) => {
            let width = '100%'; // scale as default
            let cleanAlt = alt || '';

            // check the '|' char in description (ex: ![Picture|400](url))
            if (cleanAlt.includes('|')) {
                const parts = cleanAlt.split('|');
                cleanAlt = parts[0];
                const sizePart = parts[1];

                if (/^\d+$/.test(sizePart)) {
                    width = `${sizePart}px`;
                } else {
                    width = sizePart;
                }
            }

            return (
                <img
                    src={src}
                    alt={cleanAlt}
                    title={title}
                    style={{
                        maxWidth: '100%',
                        width: width !== '100%' ? width : undefined,
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        display: 'block',
                    }}
                    {...props}
                />
            );
        }
    };

    return (
        <div className="editor-pane" key={activeNote.id}>
            <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    className="title-input"
                    value={activeNote.title}
                    placeholder="Note Title"
                    onChange={(e) => onEditField("title", e.target.value)}
                    autoFocus
                    style={{ marginBottom: 0, flex: 1 }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* hidden input for file */}
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />

                    {/* this button triggers hidden input */}
                    {!isPreview && (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                background: 'transparent',
                                color: '#aaa',
                                border: '1px solid #3e3e42',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            title="Upload Image"
                        >
                            🖼️
                        </button>
                    )}

                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        style={{
                            background: '#2d2d30',
                            color: 'white',
                            border: '1px solid #3e3e42',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                        {isPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {isPreview ? (
                <div className="markdown-preview" style={{ padding: '10px', lineHeight: '1.6', overflowY: 'auto', flex: 1 }}>
                    <ReactMarkdown components={components}>
                        {activeNote.content}
                    </ReactMarkdown>
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    className="markdown-input"
                    value={activeNote.content}
                    placeholder="Write your markdown here..."
                    onChange={(e) => onEditField("content", e.target.value)}
                />
            )}

            {activeNote.backlinks && activeNote.backlinks.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #3e3e42' }}>
                    <h4 style={{ color: '#666', marginBottom: '10px' }}>Linked to this note:</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {activeNote.backlinks.map(link => (
                            <span key={link.id} style={{ padding: '5px 10px', background: '#2d2d30', borderRadius: '15px', fontSize: '0.8rem', color: '#78a9ff', border: '1px solid #3e3e42' }}>
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