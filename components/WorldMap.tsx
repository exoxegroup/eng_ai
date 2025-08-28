import React, { useState, useMemo } from 'react';

// A more complete, yet still simplified, map path data.
const countryPaths: Record<string, { path: string; name: string }> = {
    Canada: { name: 'Canada', path: 'M134.6,64.2l-32.3,1.4l-11.5,15.7L82.1,81.8l-8.6,17.2l-1.4,18.6h25.8l6-3.1l11.5-12.9l11.5-1.4l11.5-2.9l11.5,1.4l10-4.3l14.3-1.4l15.7-5.7l12.9,2.9l5.7-7.2l-1.4-12.9l-11.5-5.7l-10-2.9l-12.9-1.4l-5.7,1.4l-8.6-1.4l-12.9-2.9l-10-1.4l-8.6-2.9l-2.9-4.3l-10,1.4l-4.3-1.4l-5.7,2.9l-2.9,2.9l-5.7,1.4l-4.3-1.4l-2.9,1.4l-7.2-2.9Z' },
    US: { name: 'United States', path: 'M82.1,81.8l-1.4,18.6l15.7,15.7l14.3-1.4l15.7-1.4l20,1.4l8.6,1.4l10,1.4h7.2l8.6-2.9l2.9-2.9h5.7l2.9,2.9l7.2,1.4l1.4,4.3v10l-1.4,2.9l-1.4,1.4l-5.7-1.4l-1.4-1.4l-2.9,1.4l-4.3,1.4h-2.9l-2.9,1.4l-2.9-1.4l-2.9-2.9l-4.3-1.4l-2.9-1.4l-4.3-2.9l-2.9-2.9l-4.3-1.4l-2.9-1.4l-4.3-1.4l-4.3-1.4l-2.9-1.4l-4.3-1.4l-4.3-1.4l-2.9-1.4l-4.3-1.4h-2.9l-2.9-1.4l-1.4-1.4l-2.9,1.4l-2.9-2.9l-2.9-1.4l-1.4-2.9l1.4-4.3l1.4-2.9l1.4-1.4l2.9,1.4l1.4,1.4l4.3-1.4Z' },
    Brazil: { name: 'Brazil', path: 'M204.6,220.7l-2.9,10l-1.4,10l1.4,11.5l2.9,10l2.9,7.2l4.3,5.7l5.7,4.3l7.2,2.9l8.6,1.4l10-1.4l10-2.9l8.6-4.3l7.2-5.7l5.7-7.2l4.3-10l2.9-11.5l1.4-10l-1.4-10l-2.9-8.6l-4.3-7.2l-5.7-5.7l-7.2-4.3l-8.6-2.9l-10-1.4l-10,1.4l-8.6,2.9l-7.2,4.3l-5.7,5.7l-4.3,7.2Z' },
    India: { name: 'India', path: 'M573.4,124.9l-1.4,15.7l1.4,12.9l2.9,11.5l5.7,8.6l7.2,7.2l8.6,5.7l10,4.3l11.5,2.9l12.9,1.4l12.9-1.4l11.5-2.9l10-4.3l8.6-5.7l7.2-7.2l5.7-8.6l4.3-10l2.9-11.5l1.4-12.9l-1.4-14.3l-2.9-12.9l-4.3-11.5l-5.7-10l-7.2-8.6l-8.6-7.2l-10-5.7l-11.5-4.3l-12.9-2.9l-12.9-1.4l-11.5,1.4l-10,2.9l-8.6,4.3l-7.2,5.7l-5.7,7.2l-4.3,8.6l-2.9,10l-1.4,11.5Z' },
    Germany: { name: 'Germany', path: 'M444.6,83.2l1.4,5.7l1.4,5.7l-1.4,5.7l-1.4,5.7l-2.9,4.3l-4.3,2.9l-5.7,1.4l-5.7-1.4l-4.3-2.9l-2.9-4.3l-1.4-5.7l-1.4-5.7l1.4-5.7l1.4-5.7l2.9-4.3l4.3-2.9l5.7-1.4l5.7,1.4l4.3,2.9l2.9,4.3Z' },
    China: { name: 'China', path: 'M614.8,96.1l-11.5,2.9l-8.6,10l-5.7,11.5l-2.9,12.9l1.4,14.3l2.9,12.9l5.7,11.5l8.6,10l11.5,7.2l14.3,5.7l15.7,4.3l17.2,2.9l18.6,1.4l18.6-1.4l17.2-2.9l15.7-4.3l14.3-5.7l11.5-7.2l10-8.6l8.6-10l7.2-11.5l5.7-12.9l4.3-14.3l2.9-15.7l1.4-17.2l-1.4-17.2l-2.9-15.7l-4.3-14.3l-5.7-12.9l-7.2-11.5l-8.6-10l-10-8.6l-11.5-7.2l-12.9-5.7l-14.3-4.3l-15.7-2.9l-17.2-1.4h-18.6l-17.2,1.4l-15.7,2.9l-14.3,4.3l-12.9,5.7l-11.5,7.2l-10,8.6l-8.6,10l-7.2,11.5l-5.7,12.9Z' },
    Australia: { name: 'Australia', path: 'M690.5,262.1l-2.9,15.7l-1.4,17.2l1.4,18.6l2.9,17.2l5.7,15.7l7.2,14.3l8.6,12.9l10,11.5l11.5,10l12.9,8.6l14.3,7.2l15.7,5.7l17.2,4.3l18.6,2.9l18.6,1.4h17.2l15.7-1.4l14.3-2.9l12.9-4.3l11.5-5.7l10-7.2l8.6-8.6l7.2-10l5.7-11.5l4.3-12.9l2.9-14.3l1.4-15.7l-1.4-17.2l-2.9-15.7l-4.3-14.3l-5.7-12.9l-7.2-11.5l-8.6-10l-10-8.6l-11.5-7.2l-12.9-5.7l-14.3-4.3l-15.7-2.9l-17.2-1.4l-18.6-1.4h-17.2Z' },
    Russia: { name: 'Russia', path: 'M403.4,26.4l24.3,1.4l17.2-1.4l5.7-4.3l11.5-1.4l20-1.4h31.5l14.3,5.7l8.6,8.6l10,12.9l10,18.6l2.9,21.5l-10,14.3l-8.6,10l-17.2,11.5l-21.5,5.7l-21.5-2.9l-12.9-8.6l-10-10l-8.6-15.7l-5.7-18.6l-1.4-20l5.7-11.5l10-8.6Z' },
    Argentina: { name: 'Argentina', path: 'M234.6,280.7l-1.4,8.6l-1.4,8.6l1.4,8.6l1.4,8.6l2.9,7.2l4.3,5.7l5.7,4.3l7.2,2.9l8.6,1.4l8.6-1.4l7.2-2.9l5.7-4.3l4.3-5.7l2.9-7.2l1.4-8.6l1.4-8.6l-1.4-8.6l-1.4-8.6l-2.9-7.2l-4.3-5.7l-5.7-4.3l-7.2-2.9l-8.6-1.4l-8.6,1.4l-7.2,2.9l-5.7,4.3l-4.3,5.7l-2.9,7.2Z' }
};

// Tooltip component for displaying country info
const Tooltip: React.FC<{ content: string; position: { x: number; y: number } }> = ({ content, position }) => {
    if (!content) return null;
    return (
        <div
            className="absolute bg-slate-800 text-white text-sm rounded-md px-3 py-1.5 pointer-events-none shadow-lg transition-opacity"
            style={{ left: position.x + 15, top: position.y + 15, zIndex: 10 }}
        >
            {content}
        </div>
    );
};

interface WorldMapProps {
  data: Record<string, number>;
}

const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const maxValue = useMemo(() => {
        const values = Object.values(data);
        return values.length > 0 ? Math.max(...values) : 1;
    }, [data]);

    const getColor = (value: number) => {
        if (!value || value === 0) return '#e2e8f0'; // --border-color for no data
        const intensity = Math.min(Math.max(Math.sqrt(value / maxValue), 0.15), 1); // Use sqrt for better color distribution
        
        const startColor = { r: 231, g: 237, b: 244 }; // --secondary-color
        const endColor = { r: 13, g: 127, b: 242 }; // --primary-color

        const r = Math.floor(startColor.r + (endColor.r - startColor.r) * intensity);
        const g = Math.floor(startColor.g + (endColor.g - startColor.g) * intensity);
        const b = Math.floor(startColor.b + (endColor.b - startColor.b) * intensity);
        
        return `rgb(${r}, ${g}, ${b})`;
    };
    
    const handleMouseEnter = (name: string, value: number) => {
        setTooltipContent(`${name}: ${value} session${value === 1 ? '' : 's'}`);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseLeave = () => {
        setTooltipContent('');
    };

    return (
         <div className="relative w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <svg viewBox="0 0 800 400" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <rect width="800" height="400" fill="var(--background-color)" />
                {Object.entries(countryPaths).map(([code, { path, name }]) => {
                    // Try to find a matching country name in the data, case-insensitively
                    const dataKey = Object.keys(data).find(k => k.toLowerCase() === name.toLowerCase());
                    const value = dataKey ? data[dataKey] : 0;
                    
                    return (
                        <path
                            key={code}
                            d={path}
                            fill={getColor(value)}
                            stroke="#f8fafc"
                            strokeWidth="0.5"
                            onMouseEnter={() => handleMouseEnter(name, value)}
                            className="transition-opacity duration-200 hover:opacity-70 cursor-pointer"
                        />
                    );
                })}
            </svg>
            <Tooltip content={tooltipContent} position={tooltipPosition} />
        </div>
    );
};

export default WorldMap;
