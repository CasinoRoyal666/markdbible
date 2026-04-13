import React, { useState, useEffect, useRef, useCallback } from "react";
import ForceGraph from "react-force-graph-2d";
import api from '../api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
// folders color palette
const FOLDER_PALETTE = [
    '#e05c5c', '#e0995c', '#d4c84a', '#5cb85c',
    '#5cb8b2', '#5c7de0', '#a05ce0', '#e05cb2',
];
const getFolderColor = (folderId, theme) => {
    if (folderId == null) return theme === 'light' ? '#0066cc' : '#78a9ff';
    return FOLDER_PALETTE[folderId % FOLDER_PALETTE.length];
};
const GraphView = ({ onClose, onNodeClick }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const fgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
    const { language, theme } = useSettings();
    const t = translations[language];
    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await api.get('notes/graph/');
                setGraphData(response.data);
            } catch (error) {
                console.error("Error fetching graph: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGraph();
        const handleResize = () => {
            setDimensions({ w: window.innerWidth, h: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const bgColor = theme === 'light' ? '#ffffff' : '#1e1e1e';
    const linkColor = theme === 'light' ? '#cccccc' : '#444444';
    const textColor = theme === 'light' ? '#111111' : '#eeeeee';
    // links counting for the size of node circle
    const incomingCount = {};
    graphData.nodes.forEach(n => { incomingCount[n.id] = 0; });
    graphData.links.forEach(l => {
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (incomingCount[targetId] !== undefined) incomingCount[targetId]++;
    });
    const getNodeVal = (node) => {
        const base = 1;
        const bonus = (incomingCount[node.id] || 0) * 2;
        return base + bonus;
    };
    // search
    const matchedIds = searchQuery.trim()
        ? new Set(
            graphData.nodes
                .filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(n => n.id)
        )
        : null;

    const paintNode = useCallback((node, ctx, globalScale) => {
        const isMatch = matchedIds ? matchedIds.has(node.id) : false;
        const isSelected = selectedNode && selectedNode.id === node.id;
        const r = Math.sqrt(getNodeVal(node)) * 4;
        const color = getFolderColor(node.folder_id, theme);
        // circle for founded/selected dots
        if (isMatch || isSelected) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = isSelected ? '#ffcc00' : '#ff6600';
            ctx.fill();
        }
        // node
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        const label = node.label;
        const fontSize = Math.max(10, 14 / globalScale);
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textWidth = ctx.measureText(label).width;
        const padding = 2;
        ctx.fillStyle = bgColor + 'cc';
        ctx.fillRect(
            node.x - textWidth / 2 - padding,
            node.y + r + 2,
            textWidth + padding * 2,
            fontSize + padding * 2
        );
        ctx.fillStyle = textColor;
        ctx.fillText(label, node.x, node.y + r + 2 + padding);
    }, [theme, graphData, selectedNode, matchedIds, bgColor, textColor]);
    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };
    const handleFitScreen = () => {
        if (fgRef.current) fgRef.current.zoomToFit(400, 40);
    };
    // data for details panel
    const getLinkedNotes = (node) => {
        if (!node) return { outgoing: [], incoming: [] };
        const nodeMap = Object.fromEntries(graphData.nodes.map(n => [n.id, n]));
        const outgoing = graphData.links
            .filter(l => {
                const src = typeof l.source === 'object' ? l.source.id : l.source;
                return src === node.id;
            })
            .map(l => {
                const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                return nodeMap[tgt];
            })
            .filter(Boolean);
        const incoming = graphData.links
            .filter(l => {
                const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                return tgt === node.id;
            })
            .map(l => {
                const src = typeof l.source === 'object' ? l.source.id : l.source;
                return nodeMap[src];
            })
            .filter(Boolean);
        return { outgoing, incoming };
    };
    const { outgoing, incoming } = getLinkedNotes(selectedNode);
    return (
        <div ref={containerRef} className="graph-overlay">
            {/* Top Panel */}
            <div className="graph-toolbar">
                <input
                    className="graph-search"
                    type="text"
                    placeholder={t.graphSearch || 'Search notes...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button onClick={handleFitScreen} className="graph-btn">
                    {t.graphFit || 'Fit'}
                </button>
                <button onClick={onClose} className="graph-btn graph-btn--close">
                    {t.closeGraph}
                </button>
            </div>
            {/* Loading Spinner */}
            {isLoading && (
                <div className="graph-loading">
                    <div className="graph-spinner" />
                </div>
            )}
            <ForceGraph
                ref={fgRef}
                width={dimensions.w}
                height={dimensions.h}
                graphData={graphData}
                nodeLabel="label"
                nodeColor={(node) => getFolderColor(node.folder_id, theme)}
                nodeVal={getNodeVal}
                linkColor={() => linkColor}
                backgroundColor={bgColor}
                nodeCanvasObject={paintNode}
                nodeCanvasObjectMode={() => 'replace'}
                onNodeClick={handleNodeClick}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                linkWidth={1.5}
            />
            {/* Details Panel */}
            {selectedNode && (
                <div className="graph-detail-panel">
                    <button
                        className="graph-detail-close"
                        onClick={() => setSelectedNode(null)}
                    >✕</button>
                    <h3 className="graph-detail-title">{selectedNode.label}</h3>
                    {selectedNode.folder_name && (
                        <p className="graph-detail-meta">
                            📁 {selectedNode.folder_name}
                        </p>
                    )}
                    {selectedNode.tags && selectedNode.tags.length > 0 && (
                        <div className="graph-detail-tags">
                            {selectedNode.tags.map(tag => (
                                <span key={tag} className="graph-tag">#{tag}</span>
                            ))}
                        </div>
                    )}
                    {outgoing.length > 0 && (
                        <div className="graph-detail-section">
                            <p className="graph-detail-section-title">
                                {t.graphOutgoing || 'Links to'}
                            </p>
                            <ul>
                                {outgoing.map(n => (
                                    <li key={n.id}>
                                        <button
                                            className="graph-link-btn"
                                            onClick={() => { setSelectedNode(n); }}
                                        >{n.label}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {incoming.length > 0 && (
                        <div className="graph-detail-section">
                            <p className="graph-detail-section-title">
                                {t.graphIncoming || 'Linked from'}
                            </p>
                            <ul>
                                {incoming.map(n => (
                                    <li key={n.id}>
                                        <button
                                            className="graph-link-btn"
                                            onClick={() => { setSelectedNode(n); }}
                                        >{n.label}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button
                        className="graph-open-btn"
                        onClick={() => { onNodeClick(selectedNode.id); }}
                    >
                        {t.graphOpenNote || 'Open note'}
                    </button>
                </div>
            )}
        </div>
    );
};
export default GraphView;