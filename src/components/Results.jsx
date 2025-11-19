import React, { useState } from 'react';
import { Check, AlertCircle, Copy, ChevronDown, ChevronUp, Box, Layers, Hash, Binary } from 'lucide-react';

const MaskVisualizer = ({ pattern }) => {
    // 8x8 grid to show the pattern
    const size = 8;
    const cells = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let isDark = false;
            switch (pattern) {
                case 0: isDark = (i + j) % 2 === 0; break;
                case 1: isDark = i % 2 === 0; break;
                case 2: isDark = j % 3 === 0; break;
                case 3: isDark = (i + j) % 3 === 0; break;
                case 4: isDark = (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0; break;
                case 5: isDark = ((i * j) % 2) + ((i * j) % 3) === 0; break;
                case 6: isDark = (((i * j) % 2) + ((i * j) % 3)) % 2 === 0; break;
                case 7: isDark = (((i + j) % 2) + ((i * j) % 3)) % 2 === 0; break;
                default: isDark = false;
            }
            cells.push(
                <div
                    key={`${i}-${j}`}
                    className={`w-1.5 h-1.5 ${isDark ? 'bg-blue-400' : 'bg-gray-700'}`}
                />
            );
        }
    }

    return (
        <div className="grid grid-cols-8 gap-0.5 p-1 bg-gray-800 rounded border border-gray-700">
            {cells}
        </div>
    );
};

const Results = ({ result, onReset }) => {
    const [showRaw, setShowRaw] = useState(false);

    if (!result) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.data);
    };

    const mainEncoding = result.chunks && result.chunks.length > 0
        ? result.chunks[0].type.charAt(0).toUpperCase() + result.chunks[0].type.slice(1)
        : 'Unknown';

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto p-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mt-10 mb-10">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-1">QR Decoded</h2>
                    <p className="text-blue-100 text-sm opacity-80">Advanced Analysis</p>
                </div>

                {/* Payload */}
                <div className="p-6 border-b border-gray-800">
                    <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Payload</label>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 break-all relative group">
                        {result.data}
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-px bg-gray-800">
                    <div className="bg-gray-900 p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={14} className="text-gray-400" />
                            <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Version</label>
                        </div>
                        <div className="text-3xl font-bold text-white">{result.version}</div>
                        <div className="text-xs text-gray-500 mt-1">{result.dimension}x{result.dimension} Modules</div>
                    </div>
                    <div className="bg-gray-900 p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Box size={14} className="text-gray-400" />
                            <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">EC Level</label>
                        </div>
                        <div className="text-3xl font-bold text-purple-400">{result.ecLevel}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {result.ecLevel === 'L' && 'Low (~7%)'}
                            {result.ecLevel === 'M' && 'Medium (~15%)'}
                            {result.ecLevel === 'Q' && 'Quartile (~25%)'}
                            {result.ecLevel === 'H' && 'High (~30%)'}
                        </div>
                    </div>
                    <div className="bg-gray-900 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Hash size={14} className="text-gray-400" />
                                <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Mask</label>
                            </div>
                            <div className="text-3xl font-bold text-blue-400 mb-2">{result.maskPattern}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MaskVisualizer pattern={result.maskPattern} />
                            <div className="text-xs text-gray-500">Pattern {result.maskPattern}</div>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Binary size={14} className="text-gray-400" />
                            <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Encoding</label>
                        </div>
                        <div className="text-xl font-bold text-white truncate">{mainEncoding}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {result.chunks ? result.chunks.length : 0} Chunk(s)
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="p-6 bg-gray-900 border-t border-gray-800 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 block">Module Size</label>
                        <div className="text-white font-mono">~{result.moduleSizePx} px</div>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 block">Total Bytes</label>
                        <div className="text-white font-mono">{result.binaryData ? result.binaryData.length : 0} bytes</div>
                    </div>
                </div>

                {/* Raw Data Toggle */}
                <div className="bg-gray-900 border-t border-gray-800">
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        className="w-full p-4 flex items-center justify-between text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <span className="text-xs uppercase tracking-wider font-semibold">Raw Data & Chunks</span>
                        {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showRaw && (
                        <div className="p-4 bg-black/30 border-t border-gray-800 space-y-4">
                            {/* Chunks */}
                            <div>
                                <label className="text-gray-500 text-xs mb-2 block">Chunks</label>
                                <div className="space-y-2">
                                    {result.chunks && result.chunks.map((chunk, i) => (
                                        <div key={i} className="bg-gray-800 p-2 rounded text-xs font-mono">
                                            <div className="text-blue-400 font-bold">{chunk.type}</div>
                                            <div className="text-gray-400 truncate">{chunk.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hex Dump (First 64 bytes) */}
                            <div>
                                <label className="text-gray-500 text-xs mb-2 block">Hex Dump (First 64 bytes)</label>
                                <div className="bg-black p-2 rounded text-xs font-mono text-gray-400 break-all">
                                    {result.binaryData && Array.from(result.binaryData).slice(0, 64).map(b => b.toString(16).padStart(2, '0')).join(' ')}
                                    {result.binaryData && result.binaryData.length > 64 && ' ...'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-900 border-t border-gray-800">
                    <button
                        onClick={onReset}
                        className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Scan Another
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Results;
