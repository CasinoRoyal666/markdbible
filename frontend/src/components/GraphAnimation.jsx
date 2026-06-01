import React from 'react';
import { motion } from 'framer-motion';

const GraphAnimation = () => {
    const nodes = Array.from({ length: 15 });
    
    return (
        <div className="graph-animation-container" style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
            opacity: 0.6
        }}>
            {nodes.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        opacity: 0 
                    }}
                    animate={{ 
                        x: [
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%"
                        ],
                        y: [
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%"
                        ],
                        opacity: [0, 0.7, 0]
                    }}
                    transition={{ 
                        duration: 10 + Math.random() * 20, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        width: '5px',
                        height: '5px',
                        backgroundColor: 'var(--accent-color)',
                        borderRadius: '50%',
                        boxShadow: '0 0 12px var(--accent-color)'
                    }}
                />
            ))}
            
            <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--accent-color)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.line
                        key={i}
                        x1={Math.random() * 100 + "%"}
                        y1={Math.random() * 100 + "%"}
                        x2={Math.random() * 100 + "%"}
                        y2={Math.random() * 100 + "%"}
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ 
                            duration: 5 + Math.random() * 10, 
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default GraphAnimation;
