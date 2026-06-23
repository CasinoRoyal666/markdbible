import React, { useState, useEffect, useRef, useCallback } from "react";
import ForceGraph from "react-force-graph-2d";
import api from '../api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useGraphSettings } from '../context/GraphSettingsContext.jsx';
import { translations } from '../locales/translations.js';
import { X, Folder, Settings } from 'lucide-react';

const FOLDER_PALETTE = [
    '#e05c5c', '#e0995c', '#d4c84a', '#5cb85c',
    '#5cb8b2', '#5c7de0', '#a05ce0', '#e05cb2',
];

const getFolderColor = (folderId, theme) => {
    if (folderId == null) return theme === 'light' ? '#0066cc' : theme === 'codex' ? '#c9a84c' : '#78a9ff';
    return FOLDER_PALETTE[folderId % FOLDER_PALETTE.length];
};

const lerpColor = (a, b, t) => {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
};

const GraphView = ({ onClose, onNodeClick }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
    const { language, theme } = useSettings();
    const { settings, activePreset, updateSetting, applyPreset, resetSettings } = useGraphSettings();
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

    const bgColor = theme === 'light' ? '#ffffff' : theme === 'codex' ? '#1a1614' : '#1e1e1e';
    const linkColor = theme === 'light' ? '#cccccc' : theme === 'codex' ? '#3a3430' : '#444444';
    const textColor = theme === 'light' ? '#111111' : theme === 'codex' ? '#d4ccc4' : '#eeeeee';

    const incomingCount = {};
    graphData.nodes.forEach(n => { incomingCount[n.id] = 0; });
    graphData.links.forEach(l => {
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (incomingCount[targetId] !== undefined) incomingCount[targetId]++;
    });

    const degreeMap = {};
    graphData.nodes.forEach(n => { degreeMap[n.id] = 0; });
    graphData.links.forEach(l => {
        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
        const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
        if (degreeMap[srcId] !== undefined) degreeMap[srcId]++;
        if (degreeMap[tgtId] !== undefined) degreeMap[tgtId]++;
    });
    const degrees = Object.values(degreeMap);
    const maxDegree = degrees.length > 0 ? Math.max(1, ...degrees) : 1;
    const minDegree = degrees.length > 0 ? Math.min(...degrees) : 0;

    const getNodeVal = (node) => {
        const base = 1;
        const bonus = (incomingCount[node.id] || 0) * 2;
        return base + bonus;
    };

    const getConnectednessColor = (nodeId) => {
        if (maxDegree === minDegree) return '#5cb85c';
        const t = (degreeMap[nodeId] - minDegree) / (maxDegree - minDegree);
        if (t < 0.5) {
            const s = t * 2;
            return lerpColor('#5c7de0', '#5cb85c', s);
        } else {
            const s = (t - 0.5) * 2;
            return lerpColor('#5cb85c', '#e05c5c', s);
        }
    };

    const getNodeColor = (node) => {
        if (settings.colorMode === 'single') return settings.nodeColorSingle;
        if (settings.colorMode === 'connectedness') return getConnectednessColor(node.id);
        return getFolderColor(node.folder_id, theme);
    };

    const nodeRelSize = 4 * settings.nodeScale;

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
        const r = Math.sqrt(getNodeVal(node)) * nodeRelSize;
        const color = getNodeColor(node);

        if (isMatch || isSelected) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = isSelected ? '#ffcc00' : '#ff6600';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        if (!settings.showLabels) return;

        const label = node.label;
        const fontSize = Math.max(10, settings.labelFontSize / globalScale);
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
    }, [theme, graphData, selectedNode, matchedIds, bgColor, textColor, settings, nodeRelSize, getNodeColor, getNodeVal]);

    const handleNodeClick = useCallback((node) => {
        setSelectedNode(node);
        setShowSettings(false);
    }, []);

    const handleSettingsToggle = useCallback(() => {
        setShowSettings(prev => !prev);
        setSelectedNode(null);
    }, []);

    const handleFitScreen = () => {
        if (fgRef.current) fgRef.current.zoomToFit(400, 40);
    };

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

    const presetNames = ['default', 'compact', 'exploration'];
    const presetLabelMap = {
        default: t.graphSettingsPresetDefault,
        compact: t.graphSettingsPresetCompact,
        exploration: t.graphSettingsPresetExploration,
        custom: t.graphSettingsPresetCustom,
    };

    return (
        <div ref={containerRef} className="graph-overlay">
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
                <button onClick={handleSettingsToggle} className="graph-btn" title={t.graphSettingsTitle}>
                    <Settings size={16} />
                </button>
                <button onClick={onClose} className="graph-btn graph-btn--close">
                    {t.closeGraph}
                </button>
            </div>

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
                nodeColor={getNodeColor}
                nodeVal={getNodeVal}
                nodeRelSize={nodeRelSize}
                linkColor={() => linkColor}
                backgroundColor={bgColor}
                nodeCanvasObject={paintNode}
                nodeCanvasObjectMode={() => 'replace'}
                onNodeClick={handleNodeClick}
                linkDirectionalArrowLength={settings.showArrows || settings.animateLinks ? 4 : 0}
                linkDirectionalArrowRelPos={1}
                linkWidth={settings.linkWidth}
                linkDirectionalParticles={settings.animateLinks ? 1 : 0}
                linkDirectionalParticleSpeed={0.004}
                linkDirectionalParticleWidth={1.5}
            />

            {selectedNode && !showSettings && (
                <div className="graph-detail-panel">
                    <button
                        className="graph-detail-close"
                        onClick={() => setSelectedNode(null)}
                    ><X size={16} /></button>
                    <h3 className="graph-detail-title">{selectedNode.label}</h3>
                    {selectedNode.folder_name && (
                        <p className="graph-detail-meta">
                            <Folder size={13} /> {selectedNode.folder_name}
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

            {showSettings && (
                <div className="graph-settings-panel">
                    <div className="graph-settings-header">
                        <h3 className="graph-settings-title">{t.graphSettingsTitle}</h3>
                        <button className="graph-settings-close" onClick={handleSettingsToggle}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="graph-settings-section">
                        <p className="graph-settings-section-title">{t.graphSettingsPresets}</p>
                        <div className="graph-settings-presets">
                            {presetNames.map(name => (
                                <button
                                    key={name}
                                    className={`graph-settings-preset-btn ${activePreset === name ? 'active' : ''}`}
                                    onClick={() => applyPreset(name)}
                                >
                                    {presetLabelMap[name]}
                                </button>
                            ))}
                            {activePreset === 'custom' && (
                                <button className="graph-settings-preset-btn active custom" disabled>
                                    {t.graphSettingsPresetCustom}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="graph-settings-section">
                        <p className="graph-settings-section-title">{t.graphSettingsNodeSize}</p>
                        <div className="graph-settings-row">
                            <input
                                type="range"
                                className="graph-settings-slider"
                                min="0.5"
                                max="3.0"
                                step="0.1"
                                value={settings.nodeScale}
                                onChange={e => updateSetting('nodeScale', parseFloat(e.target.value))}
                            />
                            <span className="graph-settings-slider-value">{settings.nodeScale.toFixed(1)}x</span>
                        </div>
                    </div>

                    <div className="graph-settings-section">
                        <p className="graph-settings-section-title">{t.graphSettingsColorMode}</p>
                        <div className="graph-settings-row">
                            <select
                                className="graph-settings-select"
                                value={settings.colorMode}
                                onChange={e => updateSetting('colorMode', e.target.value)}
                            >
                                <option value="folder">{t.graphSettingsColorByFolder}</option>
                                <option value="connectedness">{t.graphSettingsColorByConnectedness}</option>
                                <option value="single">{t.graphSettingsColorSingle}</option>
                            </select>
                        </div>
                        {settings.colorMode === 'single' && (
                            <div className="graph-settings-row">
                                <span className="graph-settings-label">{t.graphSettingsNodeColor}</span>
                                <input
                                    type="color"
                                    className="graph-settings-color"
                                    value={settings.nodeColorSingle}
                                    onChange={e => updateSetting('nodeColorSingle', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="graph-settings-section">
                        <p className="graph-settings-section-title">{t.graphSettingsLabels}</p>
                        <div className="graph-settings-row">
                            <span className="graph-settings-label">{t.graphSettingsShowLabels}</span>
                            <div
                                className={`graph-settings-toggle ${settings.showLabels ? 'on' : ''}`}
                                onClick={() => updateSetting('showLabels', !settings.showLabels)}
                            >
                                <div className="graph-settings-toggle-thumb" />
                            </div>
                        </div>
                        {settings.showLabels && (
                            <div className="graph-settings-row">
                                <span className="graph-settings-label">{t.graphSettingsLabelSize}</span>
                                <input
                                    type="range"
                                    className="graph-settings-slider"
                                    min="8"
                                    max="24"
                                    step="1"
                                    value={settings.labelFontSize}
                                    onChange={e => updateSetting('labelFontSize', parseInt(e.target.value, 10))}
                                />
                                <span className="graph-settings-slider-value">{settings.labelFontSize}px</span>
                            </div>
                        )}
                    </div>

                    <div className="graph-settings-section">
                        <p className="graph-settings-section-title">{t.graphSettingsLinks}</p>
                        <div className="graph-settings-row">
                            <span className="graph-settings-label">{t.graphSettingsLinkWidth}</span>
                            <input
                                type="range"
                                className="graph-settings-slider"
                                min="0.5"
                                max="5.0"
                                step="0.1"
                                value={settings.linkWidth}
                                onChange={e => updateSetting('linkWidth', parseFloat(e.target.value))}
                            />
                            <span className="graph-settings-slider-value">{settings.linkWidth.toFixed(1)}px</span>
                        </div>
                        <div className="graph-settings-row">
                            <span className="graph-settings-label">{t.graphSettingsShowArrows}</span>
                            <div
                                className={`graph-settings-toggle ${settings.showArrows ? 'on' : ''}`}
                                onClick={() => updateSetting('showArrows', !settings.showArrows)}
                            >
                                <div className="graph-settings-toggle-thumb" />
                            </div>
                        </div>
                        <div className="graph-settings-row">
                            <span className="graph-settings-label">{t.graphSettingsAnimateLinks}</span>
                            <div
                                className={`graph-settings-toggle ${settings.animateLinks ? 'on' : ''}`}
                                onClick={() => updateSetting('animateLinks', !settings.animateLinks)}
                            >
                                <div className="graph-settings-toggle-thumb" />
                            </div>
                        </div>
                    </div>

                    <button className="graph-settings-reset" onClick={resetSettings}>
                        {t.graphSettingsReset}
                    </button>
                </div>
            )}

        </div>
    );
};

export default GraphView;
