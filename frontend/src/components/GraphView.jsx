import React, { useState, useEffect, useRef } from "react";
import ForceGraph from "react-force-graph-2d";
import api from '../api.js'

const GraphView = ({ onClose, onNodeClick}) => {
    const [graphData, setGrapthData] = useState({ nodes: [], links: [] });

    // Ref is needed so that the graph knows the dimensions of the container
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await api.get('notes/graph/');
                setGrapthData(response.data);
            } catch (error) {
                console.error("Error fetching graph: ", error);
            }
        };

        fetchGraph()

        const handleResize = () => {
            setDimensions({ w: window.innerWidth, h: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize)
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#1e1e1e',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    background: '#3e3e42',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 1001,
                    fontSize: '1rem'
                }}
                >
                Close Graph
            </button>

            //graph themself
            <ForceGraph
                width={dimensions.w}
                height={dimensions.h}
                graphData={graphData}

                // appearance Settings
                nodeLabel="label"
                nodeColor={() => "#78a9ff"}
                linkColor={() => "#555"}
                backgroundColor="#1e1e1e"

                //node size
                nodeRelSize={6}

                onNodeClick={(node) => {
                    onNodeClick(node.id);
                }}
                />
        </div>
    );
};

export default GraphView;