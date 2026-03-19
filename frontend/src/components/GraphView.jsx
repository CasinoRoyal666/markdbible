import React, { useState, useEffect, useRef } from "react";
import ForceGraph from "react-force-graph-2d";
import api from '../api.js'
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';

const GraphView = ({ onClose, onNodeClick}) => {
    const [graphData, setGrapthData] = useState({ nodes: [], links: [] });

    // Ref is needed so that the graph knows the dimensions of the container
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

    const { language, theme } = useSettings();
    const t = translations[language];

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await api.get('notes/graph/');
                setGrapthData(response.data);
            } catch (error) {
                console.error("Error fetching graph: ", error);
            }
        };

        fetchGraph();

        const handleResize = () => {
            setDimensions({ w: window.innerWidth, h: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize)
    }, []);

    const bgColor = theme === 'light' ? '#ffffff' : '#1e1e1e';
    const nodeColor = theme === 'light' ? '#0066cc' : '#78a9ff';
    const linkColor = theme === 'light' ? '#cccccc' : '#555555';

    return (
        <div ref={containerRef} className="graph-overlay">
            <button onClick={onClose} className="graph-close-btn">
                {t.closeGraph}
            </button>
            <ForceGraph
                width={dimensions.w}
                height={dimensions.h}
                graphData={graphData}
                nodeLabel="label"
                nodeColor={() => nodeColor}
                linkColor={() => linkColor}
                backgroundColor={bgColor}
                nodeRelSize={6}
                onNodeClick={(node) => {
                    onNodeClick(node.id);
                }}
            />
        </div>
    );
};

export default GraphView;