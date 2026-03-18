import React from 'react';
import ReactMarkdown from 'react-markdown';
const MarkdownRenderer = ({ content, interactive = true, onTagClick, onWikiLinkClick }) => {
    const components = {
        p: ({ children }) => {
            return (
                <p>
                    {React.Children.map(children, (child) => {
                        if (typeof child === 'string') {
                            const parts = child.split(/(#\w+|\[\[.*?\]\])/g);
                            return parts.map((part, index) => {
                                // if it's a #tag
                                if (part.match(/^#\w+$/)) {
                                    return (
                                        <span
                                            key={index}
                                            className="obsidian-tag"
                                            onClick={interactive ? () => onTagClick(part) : undefined}
                                            style={!interactive ? { cursor: 'default' } : undefined}
                                        >
                                            {part}
                                        </span>
                                    );
                                }
                                // if it's a [[wikilink]]
                                if (part.match(/^\[\[(.*?)\]\]$/)) {
                                    const innerText = part.slice(2, -2);
                                    const title = innerText.split('|')[0].trim();
                                    const displayText = innerText.split('|').length > 1 ? innerText.split('|')[1].trim() : title;
                                    return (
                                        <span
                                            key={index}
                                            className="obsidian-internal-link"
                                            onClick={interactive ? () => onWikiLinkClick(title) : undefined}
                                            style={!interactive ? { cursor: 'default' } : undefined}
                                        >
                                            {displayText}
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
        img: ({ node, alt, src, title, ...props }) => {
            let width = '100%';
            let cleanAlt = alt || '';
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
                        margin: '10px auto',
                    }}
                    {...props}
                />
            );
        }
    };
    return (
        <ReactMarkdown components={components}>
            {content}
        </ReactMarkdown>
    );
};
export default MarkdownRenderer;