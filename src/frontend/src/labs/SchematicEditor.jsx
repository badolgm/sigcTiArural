import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position,
  ConnectionLineType,
  ConnectionMode,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLabStore } from '../stores/useLabStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- SVG SYMBOLS ---
// Helper for handle rotation
const getRotatedPosition = (pos, rotation, mirrored) => {
    let p = pos;
    // 1. Mirroring (Flip Horizontal)
    if (mirrored) {
        if (p === Position.Left) p = Position.Right;
        else if (p === Position.Right) p = Position.Left;
    }
    // 2. Rotation (Clockwise)
    // Normalize rotation to 0, 90, 180, 270 and handle negatives
    const safeRot = parseInt(rotation || 0);
    const normRot = ((safeRot % 360) + 360) % 360;
    const rots = Math.round(normRot / 90);

    for (let i = 0; i < rots; i++) {
        if (p === Position.Left) p = Position.Top;
        else if (p === Position.Top) p = Position.Right;
        else if (p === Position.Right) p = Position.Bottom;
        else if (p === Position.Bottom) p = Position.Left;
    }
    return p;
};

const NodeShell = ({ children, label, value, selected }) => (
  <div 
    className={`relative flex flex-col items-center justify-center ${selected ? 'drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]' : ''}`}
  >
     <div className="absolute -top-4 text-[10px] font-bold text-gray-400 whitespace-nowrap pointer-events-none">
        {label}
     </div>
     {children}
     <div className="absolute -bottom-4 text-[9px] text-gray-500 whitespace-nowrap pointer-events-none">
        {value}
     </div>
  </div>
);

// 1. Voltage Source (AC/DC)
const SourceNode = ({ data, selected }) => {
  const isAC = data.type === 'ac';
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  
  const posPos = getRotatedPosition(Position.Top, rot, mir);
  const negPos = getRotatedPosition(Position.Bottom, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Handle type="source" position={posPos} id="pos" className="w-3 h-3 !bg-red-500 opacity-0 hover:opacity-100 z-50" />
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md z-0" 
             style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
          <circle cx="20" cy="20" r="18" fill="#fff" stroke="#333" strokeWidth="2" />
          {isAC ? (
            <path d="M12,20 Q16,12 20,20 T28,20" fill="none" stroke="#333" strokeWidth="2" />
          ) : (
            <g>
              <path d="M20,8 L20,16" stroke="#333" strokeWidth="2" />
              <path d="M16,12 L24,12" stroke="#333" strokeWidth="2" />
              <path d="M14,26 L26,26" stroke="#333" strokeWidth="2" />
            </g>
          )}
          <circle cx="20" cy="2" r="2" fill="#333" />
          <circle cx="20" cy="38" r="2" fill="#333" />
        </svg>
        <Handle type="source" position={negPos} id="neg" className="w-3 h-3 !bg-blue-500 opacity-0 hover:opacity-100 z-50" />
      </div>
    </NodeShell>
  );
};

// 2. Resistor
const ResistorNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  const safeRot = parseInt(rot || 0);
  const normRot = ((safeRot % 360) + 360) % 360;
  const isVertical = (Math.round(normRot / 90) % 2) === 1;

  const targetPos = getRotatedPosition(Position.Left, rot, mir);
  const sourcePos = getRotatedPosition(Position.Right, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
      <div className={`relative ${isVertical ? 'w-8 h-20' : 'w-20 h-8'} flex items-center justify-center`}>
        <Handle type="target" position={targetPos} id="l" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
        <svg viewBox="0 0 80 30" className="w-full h-full overflow-visible z-0"
             style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
          <path d="M0,15 L10,15 L15,5 L25,25 L35,5 L45,25 L55,5 L65,25 L70,15 L80,15" 
                fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="0" cy="15" r="2" fill="#888" />
          <circle cx="80" cy="15" r="2" fill="#888" />
        </svg>
        <Handle type="source" position={sourcePos} id="r" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
      </div>
    </NodeShell>
  );
};

// 3. Capacitor
const CapacitorNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  const safeRot = parseInt(rot || 0);
  const normRot = ((safeRot % 360) + 360) % 360;
  const isVertical = (Math.round(normRot / 90) % 2) === 1;

  const targetPos = getRotatedPosition(Position.Top, rot, mir);
  const sourcePos = getRotatedPosition(Position.Bottom, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
      <div className="relative w-12 h-12 flex items-center justify-center">
         <Handle type="target" position={targetPos} id="l" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
         <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible z-0"
              style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
            <line x1="20" y1="0" x2="20" y2="16" stroke="#3b82f6" strokeWidth="3" />
            <line x1="5" y1="16" x2="35" y2="16" stroke="#3b82f6" strokeWidth="3" />
            <line x1="5" y1="24" x2="35" y2="24" stroke="#3b82f6" strokeWidth="3" />
            <line x1="20" y1="24" x2="20" y2="40" stroke="#3b82f6" strokeWidth="3" />
         </svg>
         <Handle type="source" position={sourcePos} id="r" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
      </div>
    </NodeShell>
  );
};

// 4. Inductor
const InductorNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  const safeRot = parseInt(rot || 0);
  const normRot = ((safeRot % 360) + 360) % 360;
  const isVertical = (Math.round(normRot / 90) % 2) === 1;

  const targetPos = getRotatedPosition(Position.Left, rot, mir);
  const sourcePos = getRotatedPosition(Position.Right, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
       <div className={`relative ${isVertical ? 'w-8 h-20' : 'w-20 h-8'} flex items-center justify-center`}>
        <Handle type="target" position={targetPos} id="l" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
        <svg viewBox="0 0 80 30" className="w-full h-full overflow-visible z-0"
             style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
           <path d="M0,15 L10,15 Q15,0 20,15 Q25,0 30,15 Q35,0 40,15 Q45,0 50,15 Q55,0 60,15 L70,15 L80,15" 
                 fill="none" stroke="#6366f1" strokeWidth="3" />
           <circle cx="0" cy="15" r="2" fill="#888" />
           <circle cx="80" cy="15" r="2" fill="#888" />
        </svg>
        <Handle type="source" position={sourcePos} id="r" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
      </div>
    </NodeShell>
  );
};

// 5. Diode
const DiodeNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  const safeRot = parseInt(rot || 0);
  const normRot = ((safeRot % 360) + 360) % 360;
  const isVertical = (Math.round(normRot / 90) % 2) === 1;

  const targetPos = getRotatedPosition(Position.Left, rot, mir);
  const sourcePos = getRotatedPosition(Position.Right, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
      <div className={`relative ${isVertical ? 'w-8 h-20' : 'w-20 h-8'} flex items-center justify-center`}>
        <Handle type="target" position={targetPos} id="l" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
        <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible z-0"
             style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
          <line x1="0" y1="20" x2="30" y2="20" stroke="#4b5563" strokeWidth="3" />
          <path d="M30,5 L30,35 L55,20 Z" fill="#4b5563" stroke="#4b5563" strokeWidth="2" />
          <line x1="55" y1="5" x2="55" y2="35" stroke="#4b5563" strokeWidth="4" />
          <line x1="55" y1="20" x2="80" y2="20" stroke="#4b5563" strokeWidth="3" />
          <circle cx="0" cy="20" r="2" fill="#888" />
          <circle cx="80" cy="20" r="2" fill="#888" />
        </svg>
        <Handle type="source" position={sourcePos} id="r" className="w-3 h-3 !bg-gray-400 opacity-0 hover:opacity-100 z-50" />
      </div>
    </NodeShell>
  );
};

// 6. Ground
const GroundNode = ({ selected }) => {
    return (
        <div className={`relative w-8 h-8 flex flex-col items-center ${selected ? 'drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]' : ''}`}>
             <Handle type="target" position={Position.Top} id="g" className="!bg-black w-3 h-3 z-50 opacity-0 hover:opacity-100" />
             <svg viewBox="0 0 20 20" className="w-full h-full z-0">
                 <line x1="10" y1="0" x2="10" y2="10" stroke="black" strokeWidth="2" />
                 <line x1="0" y1="10" x2="20" y2="10" stroke="black" strokeWidth="2" />
                 <line x1="4" y1="14" x2="16" y2="14" stroke="black" strokeWidth="2" />
                 <line x1="8" y1="18" x2="12" y2="18" stroke="black" strokeWidth="2" />
             </svg>
        </div>
    )
}

// 7. Transistor (NPN)
const TransistorNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  
  const cPos = getRotatedPosition(Position.Top, rot, mir);
  const bPos = getRotatedPosition(Position.Left, rot, mir);
  const ePos = getRotatedPosition(Position.Bottom, rot, mir);

  // Transistor handles need manual offsets if not centered.
  // Original: C (50%, 0%), B (0%, 50%), E (50%, 100%)
  // These are standard Top/Left/Bottom positions.
  // So simply changing the position prop works fine with standard styling.
  
  return (
    <NodeShell label={data.label} value={`β=${data.beta}`} selected={selected}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Collector */}
        <Handle type="target" position={cPos} id="c" className="!bg-red-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        {/* Base */}
        <Handle type="target" position={bPos} id="b" className="!bg-blue-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        {/* Emitter */}
        <Handle type="source" position={ePos} id="e" className="!bg-green-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        
        <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible z-0"
             style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
          {/* Base line */}
          <line x1="0" y1="30" x2="20" y2="30" stroke="#333" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="45" stroke="#333" strokeWidth="4" />
          {/* Collector */}
          <line x1="20" y1="20" x2="40" y2="10" stroke="#333" strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="0" stroke="#333" strokeWidth="2" />
          {/* Emitter */}
          <line x1="20" y1="40" x2="40" y2="50" stroke="#333" strokeWidth="2" />
          <line x1="40" y1="50" x2="40" y2="60" stroke="#333" strokeWidth="2" />
          {/* Arrow */}
          <path d="M32,46 L40,50 L34,40" fill="#333" stroke="none" />
          {/* Circle */}
          <circle cx="30" cy="30" r="25" fill="none" stroke="#888" strokeWidth="1" strokeDasharray="4 2" />
        </svg>
      </div>
    </NodeShell>
  );
};

// 8. Scope (Probe)
const ScopeNode = ({ data, selected }) => {
  return (
    <div className={`px-2 py-1 shadow-lg rounded bg-gray-900 border-2 ${selected ? 'border-cyan-400' : 'border-cyan-800'} min-w-[80px]`}>
      <Handle type="target" position={Position.Left} id="l" className="!bg-cyan-400" />
      <div className="flex items-center gap-1">
        <span className="text-cyan-400">⌖</span>
        <div className="text-cyan-400 font-mono text-xs">{data.label}</div>
      </div>
    </div>
  );
};

// 9. MOSFET (N-Channel)
const MosfetNode = ({ data, selected }) => {
  const rot = data.rotation || 0;
  const mir = data.mirrored || false;
  const gPos = getRotatedPosition(Position.Left, rot, mir);
  const dPos = getRotatedPosition(Position.Top, rot, mir);
  const sPos = getRotatedPosition(Position.Bottom, rot, mir);

  return (
    <NodeShell label={data.label} value={data.value} selected={selected}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <Handle type="target" position={gPos} id="g" className="!bg-green-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        <Handle type="target" position={dPos} id="d" className="!bg-red-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        <Handle type="source" position={sPos} id="s" className="!bg-blue-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
        <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible z-0" style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
          {/* Gate */}
          <line x1="0" y1="30" x2="15" y2="30" stroke="#333" strokeWidth="2" />
          <line x1="15" y1="15" x2="15" y2="45" stroke="#333" strokeWidth="2" />
          {/* Channel */}
          <line x1="25" y1="15" x2="25" y2="45" stroke="#333" strokeWidth="2" />
          {/* Drain */}
          <line x1="25" y1="20" x2="40" y2="20" stroke="#333" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="0" stroke="#333" strokeWidth="2" />
          {/* Source */}
          <line x1="25" y1="40" x2="40" y2="40" stroke="#333" strokeWidth="2" />
          <line x1="40" y1="40" x2="40" y2="60" stroke="#333" strokeWidth="2" />
          {/* Arrow */}
          <path d="M32,30 L25,30 L28,25" fill="#333" stroke="none" />
          <circle cx="30" cy="30" r="25" fill="none" stroke="#888" strokeWidth="1" strokeDasharray="4 2" />
        </svg>
      </div>
    </NodeShell>
  );
};

// 10. OpAmp
const OpAmpNode = ({ data, selected }) => {
    const rot = data.rotation || 0;
    const mir = data.mirrored || false;
    const invPos = getRotatedPosition(Position.Left, rot, mir); // -
    // Need custom offsets for + and - inputs if we want them distinct on the left side
    // For simplicity, we'll use Top/Bottom for inputs in default rotation to avoid handle overlap issues
    // Actually, standard OpAmp: - (Left Top), + (Left Bottom), Out (Right)
    
    return (
      <NodeShell label={data.label} value={data.value} selected={selected}>
        <div className="relative w-20 h-16 flex items-center justify-center">
             <Handle type="target" position={Position.Left} id="inv" style={{top: '30%'}} className="!bg-blue-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
             <Handle type="target" position={Position.Left} id="non" style={{top: '70%'}} className="!bg-blue-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
             <Handle type="source" position={Position.Right} id="out" className="!bg-red-500 w-3 h-3 opacity-0 hover:opacity-100 z-50" />
             
             <svg viewBox="0 0 80 60" className="w-full h-full overflow-visible z-0" style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
                 <path d="M20,10 L20,50 L60,30 Z" fill="white" stroke="#333" strokeWidth="2" />
                 <text x="25" y="25" fontSize="10" fill="#333">-</text>
                 <text x="25" y="45" fontSize="10" fill="#333">+</text>
             </svg>
        </div>
      </NodeShell>
    );
};

// 11. Digital Logic Gate
const LogicGateNode = ({ data, selected }) => {
    const rot = data.rotation || 0;
    const { kind } = data; // AND, OR, NAND, XOR, NOT
    
    return (
      <NodeShell label={kind} value="" selected={selected}>
         <div className="relative w-16 h-12 flex items-center justify-center">
            {kind !== 'NOT' && <Handle type="target" position={Position.Left} id="a" style={{top: '30%'}} className="!bg-green-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />}
            <Handle type="target" position={Position.Left} id="b" style={{top: kind === 'NOT' ? '50%' : '70%'}} className="!bg-green-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />
            <Handle type="source" position={Position.Right} id="out" className="!bg-cyan-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />
            
            <svg viewBox="0 0 60 40" className="w-full h-full z-0" style={{ transform: `rotate(${rot}deg)` }}>
                {kind === 'AND' && <path d="M10,5 L30,5 Q50,5 50,20 Q50,35 30,35 L10,35 Z" fill="#222" stroke="#0f0" strokeWidth="2" />}
                {kind === 'OR' && <path d="M10,5 Q25,20 10,35 Q35,35 50,20 Q35,5 10,5 Z" fill="#222" stroke="#0f0" strokeWidth="2" />}
                {kind === 'NOT' && <path d="M15,5 L45,20 L15,35 Z" fill="#222" stroke="#0f0" strokeWidth="2" />}
                {kind === 'NOT' && <circle cx="48" cy="20" r="3" stroke="#0f0" fill="none" />}
                {kind === 'NAND' && <path d="M10,5 L30,5 Q50,5 50,20 Q50,35 30,35 L10,35 Z" fill="#222" stroke="#0f0" strokeWidth="2" />}
                {kind === 'NAND' && <circle cx="53" cy="20" r="3" stroke="#0f0" fill="none" />}
                {kind === 'XOR' && (
                    <g>
                        <path d="M15,5 Q30,20 15,35" fill="none" stroke="#0f0" strokeWidth="2" />
                        <path d="M20,5 Q35,20 20,35 Q45,35 60,20 Q45,5 20,5 Z" fill="#222" stroke="#0f0" strokeWidth="2" />
                    </g>
                )}
            </svg>
         </div>
      </NodeShell>
    );
};

// 12. Transformer
const TransformerNode = ({ data, selected }) => {
    const rot = data.rotation || 0;
    const mir = data.mirrored || false;

    return (
      <NodeShell label={data.label} value={data.value} selected={selected}>
         <div className="relative w-20 h-16 flex items-center justify-center">
            {/* Primary Handles */}
            <Handle type="target" position={Position.Left} id="p1" style={{top: '25%'}} className="!bg-blue-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />
            <Handle type="target" position={Position.Left} id="p2" style={{top: '75%'}} className="!bg-blue-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />
            
            {/* Secondary Handles */}
            <Handle type="source" position={Position.Right} id="s1" style={{top: '25%'}} className="!bg-red-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />
            <Handle type="source" position={Position.Right} id="s2" style={{top: '75%'}} className="!bg-red-400 w-2 h-2 opacity-0 hover:opacity-100 z-50" />

            <svg viewBox="0 0 80 60" className="w-full h-full overflow-visible z-0" style={{ transform: `rotate(${rot}deg) scaleX(${mir ? -1 : 1})` }}>
                {/* Primary Coil */}
                <path d="M25,10 C15,10 15,23 25,23 C15,23 15,36 25,36 C15,36 15,50 25,50" fill="none" stroke="#eab308" strokeWidth="2" />
                {/* Secondary Coil */}
                <path d="M55,10 C65,10 65,23 55,23 C65,23 65,36 55,36 C65,36 65,50 55,50" fill="none" stroke="#eab308" strokeWidth="2" />
                
                {/* Core */}
                <line x1="38" y1="10" x2="38" y2="50" stroke="#888" strokeWidth="2" />
                <line x1="42" y1="10" x2="42" y2="50" stroke="#888" strokeWidth="2" />
            </svg>
         </div>
      </NodeShell>
    );
};

// 13. Flip-Flop (D-Type)
const FlipFlopNode = ({ data, selected }) => {
    return (
        <NodeShell label="D-FF" value="" selected={selected}>
            <div className="relative w-16 h-20 bg-gray-900 border-2 border-green-600 rounded flex flex-col justify-between py-2 shadow-lg">
                 <div className="flex justify-between w-full px-2 items-center h-1/2">
                     <span className="text-[10px] font-mono text-green-400">D</span>
                     <span className="text-[10px] font-mono text-green-400">Q</span>
                 </div>
                 <div className="flex justify-between w-full px-2 items-center h-1/2">
                     <span className="text-[10px] font-mono text-yellow-400">></span>
                     <span className="text-[10px] font-mono text-green-400">Q'</span>
                 </div>
                 
                 <Handle type="target" position={Position.Left} id="d" style={{top: '25%'}} className="!bg-green-400 w-2 h-2" />
                 <Handle type="target" position={Position.Left} id="clk" style={{top: '75%'}} className="!bg-yellow-400 w-2 h-2" />
                 <Handle type="source" position={Position.Right} id="q" style={{top: '25%'}} className="!bg-cyan-400 w-2 h-2" />
                 <Handle type="source" position={Position.Right} id="qb" style={{top: '75%'}} className="!bg-cyan-400 w-2 h-2" />
            </div>
        </NodeShell>
    )
};

// 14. Shift Register (Simplified)
const ShiftRegisterNode = ({ data, selected }) => {
             return (
                <NodeShell label="Shift Reg" value="8-bit" selected={selected}>
                    <div className="relative w-28 h-12 bg-gray-900 border-2 border-purple-600 rounded flex items-center justify-between px-2 shadow-lg">
                         <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-green-400">DATA</span>
                            <span className="text-[8px] text-yellow-400">CLK</span>
                         </div>
                         <div className="flex gap-0.5">
                            {[...Array(4)].map((_,i)=><div key={i} className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-50"></div>)}
                         </div>
                         <span className="text-[8px] text-cyan-400">OUT</span>
                         
                         <Handle type="target" position={Position.Left} id="data" style={{top: '30%'}} className="!bg-green-400 w-2 h-2" />
                         <Handle type="target" position={Position.Left} id="clk" style={{top: '70%'}} className="!bg-yellow-400 w-2 h-2" />
                         <Handle type="source" position={Position.Right} id="out" className="!bg-cyan-400 w-2 h-2" />
                    </div>
                </NodeShell>
             )
        };

        // 15. Karnaugh Map (Visual Tool)
        const KarnaughMapNode = ({ id, data, selected }) => {
            const { setNodes } = useReactFlow();
            const values = data.values || Array(16).fill(0);
            
            const toggleCell = (idx) => {
                const newValues = [...values];
                newValues[idx] = newValues[idx] === 0 ? 1 : 0;
                setNodes(nds => nds.map(n => {
                    if (n.id === id) {
                        return { ...n, data: { ...n.data, values: newValues } };
                    }
                    return n;
                }));
            };

            return (
                <NodeShell label="K-Map" value="4-Var" selected={selected}>
                    <div className="relative w-32 h-32 bg-gray-100 border-2 border-blue-600 rounded flex flex-col items-center justify-center shadow-lg p-1 nodrag">
                        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0.5 bg-gray-300">
                            {values.map((v,i) => (
                                <div key={i} 
                                     onClick={(e) => { e.stopPropagation(); toggleCell(i); }}
                                     className="bg-white flex items-center justify-center text-[8px] font-mono text-gray-800 hover:bg-yellow-200 cursor-pointer">
                                    {v}
                                </div>
                            ))}
                        </div>
                        <div className="absolute -top-3 -left-3 text-[10px] text-blue-400 bg-gray-900 px-1 rounded">AB\CD</div>
                    </div>
                </NodeShell>
            );
        };

        const nodeTypes = {
          source: SourceNode,
          resistor: ResistorNode,
          capacitor: CapacitorNode,
          inductor: InductorNode,
          diode: DiodeNode,
          gnd: GroundNode,
          transistor: TransistorNode,
          mosfet: MosfetNode,
          opamp: OpAmpNode,
          logic: LogicGateNode,
          transformer: TransformerNode,
          flipflop: FlipFlopNode,
          shiftreg: ShiftRegisterNode,
          karnaugh: KarnaughMapNode,
          scope: ScopeNode,
        };

// --- INITIAL NODES ---
const initialNodes = [
  { id: 'v1', type: 'source', position: { x: 50, y: 200 }, data: { type: 'ac', label: 'Vin', value: '5V' } },
  { id: 'r1', type: 'resistor', position: { x: 150, y: 100 }, data: { label: 'R1', value: '1k' } },
  { id: 'c1', type: 'capacitor', position: { x: 300, y: 200 }, data: { label: 'C1', value: '1uF' } },
  { id: 'gnd1', type: 'gnd', position: { x: 320, y: 300 }, data: {} },
  { id: 'scope_in', type: 'scope', position: { x: 100, y: 50 }, data: { label: 'Input' } },
  { id: 'scope_out', type: 'scope', position: { x: 400, y: 200 }, data: { label: 'Output' } },
];

const initialEdges = [
  { id: 'e1', source: 'v1', sourceHandle: 'pos', target: 'r1', targetHandle: 'l' },
  { id: 'e2', source: 'r1', sourceHandle: 'r', target: 'c1', targetHandle: 'l' },
  { id: 'e3', source: 'c1', sourceHandle: 'r', target: 'gnd1', targetHandle: 'g' },
  { id: 'e4', source: 'v1', sourceHandle: 'neg', target: 'gnd1', targetHandle: 'g' },
  { id: 'e_scope1', source: 'v1', sourceHandle: 'pos', target: 'scope_in', targetHandle: 'l' },
  { id: 'e_scope2', source: 'r1', sourceHandle: 'r', target: 'scope_out', targetHandle: 'l' },
];

const SchematicEditor = ({ onRunSimulation, labSignalParams }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [simResult, setSimResult] = useState(null);
  const [simData, setSimData] = useState([]); // For graphs
  const [simStatus, setSimStatus] = useState('idle');
  const [isEngineeringLines, setIsEngineeringLines] = useState(false); // Toggle line type
  const [showNetlist, setShowNetlist] = useState(false);
  const [netlistContent, setNetlistContent] = useState('');

  // Sync Lab Generator to Source Nodes
  useEffect(() => {
      if (labSignalParams) {
          setNodes((nds) => nds.map((n) => {
              if (n.type === 'source' && n.data.useLab) {
                  const { type, amp, freq } = labSignalParams;
                  return { 
                      ...n, 
                      data: { 
                          ...n.data, 
                          value: `LAB (${type}): ${amp}V, ${freq}Hz`, 
                          volt: parseFloat(amp), 
                          freq: parseFloat(freq),
                          waveType: type
                      } 
                  };
              }
              return n;
          }));
      }
  }, [labSignalParams, setNodes]);

  const setSchematic = useLabStore((state) => state.setSchematic);
  const savedSchematic = useLabStore((state) => state.electronicsData?.schematic);

  React.useEffect(() => {
    if (savedSchematic && Array.isArray(savedSchematic.nodes) && savedSchematic.nodes.length > 0) {
      setNodes(savedSchematic.nodes);
    }
    if (savedSchematic && Array.isArray(savedSchematic.edges) && savedSchematic.edges.length > 0) {
      setEdges(savedSchematic.edges);
      // Infer line type from first edge if available
      if (savedSchematic.edges[0]?.type === 'step') {
          setIsEngineeringLines(true);
      }
    }
  }, []);

  const toggleLineType = () => {
    const newValue = !isEngineeringLines;
    setIsEngineeringLines(newValue);
    const newType = newValue ? 'step' : 'default';
    setEdges((eds) => eds.map(e => ({ ...e, type: newType })));
  };

  React.useEffect(() => {
    setSchematic({ nodes, edges });
  }, [nodes, edges, setSchematic]);
  const saveLocal = () => {
    setSchematic({ nodes, edges });
    try {
      const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'schematic.json'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };
  const loadLocal = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      setNodes(obj.nodes || []); setEdges(obj.edges || []);
      setSchematic({ nodes: obj.nodes || [], edges: obj.edges || [] });
    } catch {}
  };
  const exportNetlist = () => {
    const { code, probes } = generateNetlist(nodes, edges);
    try {
      const blob = new Blob([JSON.stringify({ code, probes }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'netlist.json'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const toggleNetlist = () => {
    if (!showNetlist) {
        const { code } = generateNetlist(nodes, edges);
        setNetlistContent(code);
    }
    setShowNetlist(!showNetlist);
  };

  const onConnect = useCallback((params) => {
      const type = isEngineeringLines ? 'step' : 'default';
      setEdges((eds) => addEdge({ ...params, type }, eds));
  }, [setEdges, isEngineeringLines]);

  // --- ADD COMPONENT ---
  const addComponent = (type, subType = null) => {
    const id = `${type}_${Date.now()}`;
    let data = { 
        label: type.charAt(0).toUpperCase() + type.slice(1), 
        value: '0',
    };

    if(type === 'resistor') data.value = '1k';
    else if(type === 'capacitor') data.value = '1uF';
    else if(type === 'inductor') data.value = '1mH';
    else if(type === 'source') { data.value = '10V'; data.type = 'dc'; }
    else if(type === 'transistor') { data.value = 'NPN'; data.beta = 100; }
    else if(type === 'mosfet') { data.value = 'NMOS'; data.k = 0.001; data.vt = 2.0; }
    else if(type === 'opamp') { data.value = 'LM741'; data.gain = 100000; }
    else if(type === 'logic') { data.value = subType || 'AND'; data.kind = subType || 'AND'; }
    else if(type === 'transformer') { data.value = '1:1'; data.ratio = 1.0; }
    else if(type === 'flipflop') { data.value = 'D-Type'; }
    else if(type === 'shiftreg') { data.value = '8-bit'; }
    else if(type === 'karnaugh') { data.value = 'Map'; }

    const newNode = {
      id,
      type,
      position: { x: 200 + Math.random()*50, y: 200 + Math.random()*50 },
      data,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // --- DELETE COMPONENT ---
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // --- ROTATE COMPONENT ---
  const rotateSelected = useCallback(() => {
    setNodes((nds) => nds.map((node) => {
        if (node.selected) {
            const currentRot = node.data.rotation || 0;
            return { ...node, data: { ...node.data, rotation: (currentRot + 90) % 360 } };
        }
        return node;
    }));
  }, [setNodes]);

  // --- MIRROR COMPONENT ---
  const mirrorSelected = useCallback(() => {
    setNodes((nds) => nds.map((node) => {
        if (node.selected) {
            const currentMirror = node.data.mirrored || false;
            return { ...node, data: { ...node.data, mirrored: !currentMirror } };
        }
        return node;
    }));
  }, [setNodes]);

  // --- EDIT COMPONENT ---
  const onNodeDoubleClick = (event, node) => {
    if (node.type === 'resistor' || node.type === 'capacitor' || node.type === 'inductor') {
        const newVal = window.prompt(`Editar valor de ${node.data.label}:`, node.data.value);
        if (newVal !== null) {
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) {
                    return { ...n, data: { ...n.data, value: newVal } };
                }
                return n;
            }));
        }
    } else if (node.type === 'transistor') {
        const newBeta = window.prompt(`Beta (Ganancia):`, node.data.beta || 100);
        if (newBeta !== null) {
            const newIs = window.prompt(`Corriente de Saturación (Is) [e.g. 1e-14]:`, node.data.is || 1e-14);
            if(newIs !== null) {
                setNodes((nds) => nds.map((n) => {
                    if (n.id === node.id) {
                        return { ...n, data: { ...n.data, beta: parseFloat(newBeta), is: parseFloat(newIs) } };
                    }
                    return n;
                }));
            }
        }
    } else if (node.type === 'mosfet') {
        const newK = window.prompt(`K (Transconductancia A/V^2):`, node.data.k || 0.001);
        if (newK !== null) {
            const newVt = window.prompt(`Vt (Voltaje Umbral V):`, node.data.vt || 2.0);
            if(newVt !== null) {
                setNodes((nds) => nds.map((n) => {
                    if (n.id === node.id) return { ...n, data: { ...n.data, k: parseFloat(newK), vt: parseFloat(newVt) } };
                    return n;
                }));
            }
        }
    } else if (node.type === 'opamp') {
        const newGain = window.prompt(`Ganancia (Open Loop):`, node.data.gain || 100000);
        if (newGain !== null) {
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) return { ...n, data: { ...n.data, gain: parseFloat(newGain) } };
                return n;
            }));
        }
    } else if (node.type === 'transformer') {
        const newRatio = window.prompt(`Relación de Transformación (Np/Ns):`, node.data.ratio || 1.0);
        if (newRatio !== null) {
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) return { ...n, data: { ...n.data, ratio: parseFloat(newRatio), value: `1:${parseFloat(newRatio)}` } };
                return n;
            }));
        }
    } else if (node.type === 'source') {
        const currentVal = node.data.useLab ? 'LAB' : parseFloat(node.data.value) || 0;
        const input = window.prompt(`Amplitud (V) o escriba 'LAB' para usar generador:`, currentVal);
        
        if (input !== null) {
            if (input.trim().toUpperCase() === 'LAB') {
                 setNodes((nds) => nds.map((n) => {
                    if (n.id === node.id) {
                        return { 
                            ...n, 
                            data: { 
                                ...n.data, 
                                useLab: true, 
                                label: 'V_LAB',
                                // Will be updated by useEffect immediately if params exist
                                value: 'Sincronizando...' 
                            } 
                        };
                    }
                    return n;
                }));
            } else {
                const newVolt = parseFloat(input);
                if (!isNaN(newVolt)) {
                    let newFreq = 0;
                    if (node.data.type === 'ac') {
                        const f = window.prompt(`Frecuencia (Hz):`, node.data.freq || 60);
                        newFreq = parseFloat(f) || 60;
                    }
                    
                    setNodes((nds) => nds.map((n) => {
                        if (n.id === node.id) {
                            const displayVal = node.data.type === 'ac' ? `${newVolt}V, ${newFreq}Hz` : `${newVolt}V`;
                            return { ...n, data: { ...n.data, useLab: false, value: displayVal, volt: newVolt, freq: newFreq, waveType: 'sine' } };
                        }
                        return n;
                    }));
                }
            }
        }
    } else if (node.type === 'scope') {
        const newLabel = window.prompt(`Etiqueta del Probe:`, node.data.label);
        if (newLabel !== null) {
             setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) {
                    return { ...n, data: { ...n.data, label: newLabel } };
                }
                return n;
            }));
        }
    }
  };

  // --- NETLIST GENERATION ---
  const generateNetlist = (nodes, edges) => {
    // 1. Identificar Nodos Eléctricos
    const getKey = (nId, hId) => `${nId}:${hId}`;
    const adj = new Map();

    const addConn = (k1, k2) => {
        if(!adj.has(k1)) adj.set(k1, []);
        if(!adj.has(k2)) adj.set(k2, []);
        adj.get(k1).push(k2);
        adj.get(k2).push(k1);
    };

    edges.forEach(e => {
        if(e.sourceHandle && e.targetHandle) {
            addConn(getKey(e.source, e.sourceHandle), getKey(e.target, e.targetHandle));
        }
    });

    const netMap = new Map();
    let netCount = 0;
    const visited = new Set();
    const keys = Array.from(adj.keys());

    for (const k of keys) {
        if (visited.has(k)) continue;
        netCount++;
        const q = [k];
        visited.add(k);
        netMap.set(k, netCount);
        while (q.length) {
            const u = q.shift();
            const neighbors = adj.get(u) || [];
            for (const v of neighbors) {
                if (!visited.has(v)) {
                    visited.add(v);
                    netMap.set(v, netCount);
                    q.push(v);
                }
            }
        }
    }

    // Detectar GND (Source Neg o componente GND explícito)
    let gndNet = -1;
    // Prioridad: nodo conectado a un componente tipo 'gnd'
    const gndNodes = nodes.filter(n => n.type === 'gnd');
    if(gndNodes.length > 0) {
        const gndKey = getKey(gndNodes[0].id, 'g');
        if(netMap.has(gndKey)) gndNet = netMap.get(gndKey);
    } 
    // Fallback: negativo de la primera fuente
    if(gndNet === -1) {
        const sources = nodes.filter(n => n.type === 'source');
        if (sources.length > 0) {
            const negKey = getKey(sources[0].id, 'neg');
            if (netMap.has(negKey)) gndNet = netMap.get(negKey);
        }
    }

    const mapNet = (netId) => (netId === gndNet ? 0 : netId);
    const getHandleNet = (nId, hId) => {
        const k = getKey(nId, hId);
        if (!netMap.has(k)) { netCount++; netMap.set(k, netCount); }
        return mapNet(netMap.get(k));
    };

    const parseVal = (str) => {
        if(!str) return 0;
        const s = str.toString().replace('V','').replace('Hz','').split(',')[0].trim(); // Handle "5V, 60Hz"
        let m = 1;
        if(s.includes('k')) m=1e3;
        if(s.includes('M')) m=1e6;
        if(s.includes('m') && !s.includes('mH')) m=1e-3;
        if(s.includes('u')) m=1e-6;
        if(s.includes('n')) m=1e-9;
        if(s.includes('p')) m=1e-12;
        return parseFloat(s) * m;
    };

    let lines = [];
    const probes = [];

    nodes.forEach(n => {
        const val = n.data.volt !== undefined ? n.data.volt : parseVal(n.data.value);
        const name = `${n.type.toUpperCase().charAt(0)}_${n.id}`;

        if (n.type === 'resistor') {
            lines.push(`c.add_resistor("${name}", ${getHandleNet(n.id, 'l')}, ${getHandleNet(n.id, 'r')}, ${val})`);
        } else if (n.type === 'capacitor') {
            lines.push(`c.add_capacitor("${name}", ${getHandleNet(n.id, 'l')}, ${getHandleNet(n.id, 'r')}, ${val})`);
        } else if (n.type === 'inductor') {
            lines.push(`c.add_inductor("${name}", ${getHandleNet(n.id, 'l')}, ${getHandleNet(n.id, 'r')}, ${val})`);
        } else if (n.type === 'transistor') {
            const beta = n.data.beta || 100;
            const is = n.data.is || 1e-14;
            lines.push(`c.add_transistor("${name}", ${getHandleNet(n.id, 'c')}, ${getHandleNet(n.id, 'b')}, ${getHandleNet(n.id, 'e')}, ${beta}, ${is})`);
        } else if (n.type === 'mosfet') {
            const k = n.data.k || 0.001;
            const vt = n.data.vt || 2.0;
            lines.push(`c.add_mosfet("${name}", ${getHandleNet(n.id, 'd')}, ${getHandleNet(n.id, 'g')}, ${getHandleNet(n.id, 's')}, ${k}, ${vt})`);
        } else if (n.type === 'opamp') {
            const gain = n.data.gain || 100000;
            lines.push(`c.add_opamp("${name}", ${getHandleNet(n.id, 'non')}, ${getHandleNet(n.id, 'inv')}, ${getHandleNet(n.id, 'out')}, ${gain})`);
        } else if (n.type === 'transformer') {
            const ratio = n.data.ratio || 1.0;
            lines.push(`c.add_transformer("${name}", ${getHandleNet(n.id, 'p1')}, ${getHandleNet(n.id, 'p2')}, ${getHandleNet(n.id, 's1')}, ${getHandleNet(n.id, 's2')}, ${ratio})`);
        } else if (n.type === 'logic') {
            const kind = n.data.kind || 'AND';
            if (kind === 'NOT') {
                 lines.push(`c.add_logic("${name}", "${kind}", [${getHandleNet(n.id, 'b')}], ${getHandleNet(n.id, 'out')})`);
            } else {
                 lines.push(`c.add_logic("${name}", "${kind}", [${getHandleNet(n.id, 'a')}, ${getHandleNet(n.id, 'b')}], ${getHandleNet(n.id, 'out')})`);
            }
        } else if (n.type === 'flipflop') {
            // D-Type FlipFlop: inputs=[clk, d], outputs=[q, qb]
            lines.push(`c.add_flipflop("${name}", "D", [${getHandleNet(n.id, 'clk')}, ${getHandleNet(n.id, 'd')}], [${getHandleNet(n.id, 'q')}, ${getHandleNet(n.id, 'qb')}])`);
        } else if (n.type === 'shiftreg') {
            // Shift Register: inputs=[clk, data], outputs=[out]
            lines.push(`c.add_shift_register("${name}", "8-bit", [${getHandleNet(n.id, 'clk')}, ${getHandleNet(n.id, 'data')}], [${getHandleNet(n.id, 'out')}])`);
        } else if (n.type === 'source') {
            const freq = n.data.freq !== undefined ? n.data.freq : (n.data.type === 'ac' ? 60 : 0); 
            const wave = n.data.waveType || 'sine';
            lines.push(`c.add_voltage("${name}", ${getHandleNet(n.id, 'pos')}, ${getHandleNet(n.id, 'neg')}, ${val}, ${freq}, "${wave}")`);
        } else if (n.type === 'scope') {
            const net = getHandleNet(n.id, 'l');
            probes.push({ label: n.data.label, net: net });
        }
    });

    // Shunt resistors for floating nodes (stability)
    // Simplified: relying on solver robustness or user connectivity
    
    return { code: lines.join('\n'), probes };
  };

  const handleSimulate = async () => {
      if (!onRunSimulation) return;
      setSimStatus('running');
      setSimResult(null);
      
      const { code, probes } = generateNetlist(nodes, edges);

      // --- PYTHON TRANSIENT SOLVER ---
      const solverCode = `
import numpy as np
import json

class Circuit:
    def __init__(self):
        self.components = []
        self.nodes = set([0])
        self.node_map = {}

    def add_resistor(self, name, n1, n2, val):
        self.components.append({'type':'R', 'name':name, 'n1':n1, 'n2':n2, 'val':val})
        self.nodes.add(n1); self.nodes.add(n2)

    def add_capacitor(self, name, n1, n2, val):
        self.components.append({'type':'C', 'name':name, 'n1':n1, 'n2':n2, 'val':val, 'v_prev':0})
        self.nodes.add(n1); self.nodes.add(n2)

    def add_inductor(self, name, n1, n2, val):
        self.components.append({'type':'L', 'name':name, 'n1':n1, 'n2':n2, 'val':val, 'i_prev':0})
        self.nodes.add(n1); self.nodes.add(n2)

    def add_voltage(self, name, n1, n2, val, freq=0, wave_type='sine'):
        self.components.append({'type':'V', 'name':name, 'n1':n1, 'n2':n2, 'val':val, 'freq':freq, 'wave':wave_type})
        self.nodes.add(n1); self.nodes.add(n2)
        
    def add_transistor(self, name, nc, nb, ne, beta, Is):
        # Ebers-Moll Model parameters (Simplified)
        alpha_f = beta / (1.0 + beta)
        alpha_r = 0.5 # Default reverse alpha
        self.components.append({
            'type':'Q', 'name':name, 'nc':nc, 'nb':nb, 'ne':ne, 
            'beta':beta, 'Is':Is, 'Vt':0.02585,
            'alpha_f': alpha_f, 'alpha_r': alpha_r
        })
        self.nodes.add(nc); self.nodes.add(nb); self.nodes.add(ne)

    def add_mosfet(self, name, nd, ng, ns, k, vt):
        self.components.append({'type':'M', 'name':name, 'nd':nd, 'ng':ng, 'ns':ns, 'k':k, 'vt':vt})
        self.nodes.add(nd); self.nodes.add(ng); self.nodes.add(ns)

    def add_opamp(self, name, n_plus, n_minus, n_out, gain):
        self.components.append({'type':'E', 'name':name, 'n_plus':n_plus, 'n_minus':n_minus, 'n_out':n_out, 'gain':gain})
        self.nodes.add(n_plus); self.nodes.add(n_minus); self.nodes.add(n_out)

    def add_transformer(self, name, p1, p2, s1, s2, ratio):
        self.components.append({'type':'T', 'name':name, 'p1':p1, 'p2':p2, 's1':s1, 's2':s2, 'ratio':ratio})
        self.nodes.add(p1); self.nodes.add(p2); self.nodes.add(s1); self.nodes.add(s2)

    def add_logic(self, name, kind, inputs, n_out):
        self.components.append({'type':'Logic', 'name':name, 'kind':kind, 'inputs':inputs, 'n_out':n_out})
        for n in inputs: self.nodes.add(n)
        self.nodes.add(n_out)
        
    def add_flipflop(self, name, kind, inputs, outputs):
        self.components.append({'type':'FF', 'name':name, 'kind':kind, 'inputs':inputs, 'outputs':outputs, 'state':{'Q':0, 'clk_prev':0}})
        for n in inputs: self.nodes.add(n)
        for n in outputs: self.nodes.add(n)

    def add_shift_register(self, name, kind, inputs, outputs):
        # 8-bit Shift Register
        self.components.append({'type':'SR', 'name':name, 'kind':kind, 'inputs':inputs, 'outputs':outputs, 'state':{'bits':[0]*8, 'clk_prev':0}})
        for n in inputs: self.nodes.add(n)
        for n in outputs: self.nodes.add(n)

    def solve_transient(self, t_end=0.05, dt=1e-4):
        node_list = sorted(list(self.nodes))
        self.node_map = {n:i for i,n in enumerate(node_list)} 
        N = len(node_list)
        
        # Calculate dimension
        v_sources = [c for c in self.components if c['type']=='V']
        opamps = [c for c in self.components if c['type']=='E']
        transformers = [c for c in self.components if c['type']=='T']
        
        # Dimensions: N (nodes) + M (Voltage Sources) + E (OpAmps) + T (Transformers)
        dim = N + len(v_sources) + len(opamps) + len(transformers)
        
        times = np.arange(0, t_end, dt)
        history = {str(n): [] for n in node_list}
        history['time'] = []
        
        # Initial guess for voltages (0)
        x = np.zeros(dim)
        
        for t in times:
            # Update sequential logic states (FlipFlops) at start of step based on PREVIOUS x
            for c in self.components:
                if c['type'] == 'FF':
                    clk_idx = self.node_map[c['inputs'][0]] # Assuming 1st input is CLK
                    clk_val = x[clk_idx]
                    prev_clk = c['state']['clk_prev']
                    
                    # Rising edge detection
                    if clk_val > 2.5 and prev_clk <= 2.5:
                        # Logic update
                        if c['kind'] == 'JK':
                            j = x[self.node_map[c['inputs'][1]]] > 2.5
                            k = x[self.node_map[c['inputs'][2]]] > 2.5
                            q = c['state']['Q']
                            if j and k: q = 1 - q # Toggle
                            elif j and not k: q = 1 # Set
                            elif not j and k: q = 0 # Reset
                            c['state']['Q'] = q
                        elif c['kind'] == 'D':
                            d = x[self.node_map[c['inputs'][1]]] > 2.5
                            c['state']['Q'] = 1 if d else 0
                        elif c['kind'] == 'T':
                            t_in = x[self.node_map[c['inputs'][1]]] > 2.5
                            if t_in: c['state']['Q'] = 1 - c['state']['Q']
                            
                    c['state']['clk_prev'] = clk_val

                elif c['type'] == 'SR':
                    # Shift Register Update
                    clk_idx = self.node_map[c['inputs'][0]]
                    clk_val = x[clk_idx]
                    prev_clk = c['state']['clk_prev']
                    
                    if clk_val > 2.5 and prev_clk <= 2.5: # Rising Edge
                        data_idx = self.node_map[c['inputs'][1]]
                        d_val = 1 if x[data_idx] > 2.5 else 0
                        # Shift right: Insert at 0, remove last
                        c['state']['bits'].insert(0, d_val)
                        c['state']['bits'].pop()
                    
                    c['state']['clk_prev'] = clk_val

            # Newton-Raphson Iteration (Max 20 iter per step)
            for iter in range(20):
                G = np.zeros((dim, dim))
                I = np.zeros(dim)
                extra_idx = N
                
                # Build Matrix
                for c in self.components:
                    if c['type'] == 'R':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        g = 1.0 / (c['val'] + 1e-12)
                        G[n1,n1]+=g; G[n2,n2]+=g; G[n1,n2]-=g; G[n2,n1]-=g
                        
                    elif c['type'] == 'C':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        gc = c['val'] / dt
                        G[n1,n1]+=gc; G[n2,n2]+=gc; G[n1,n2]-=gc; G[n2,n1]-=gc
                        i_src = gc * c['v_prev']
                        I[n1] += i_src; I[n2] -= i_src
                        
                    elif c['type'] == 'L':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        gl = dt / (c['val'] + 1e-12)
                        G[n1,n1]+=gl; G[n2,n2]+=gl; G[n1,n2]-=gl; G[n2,n1]-=gl
                        I[n1] -= c['i_prev']; I[n2] += c['i_prev']
                        
                    elif c['type'] == 'V':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        val = c['val']
                        if c['freq'] > 0:
                            omega_t = 2 * np.pi * c['freq'] * t
                            wave = c.get('wave', 'sine')
                            if wave == 'sine':
                                val = c['val'] * np.sin(omega_t)
                            elif wave == 'square':
                                val = c['val'] * np.sign(np.sin(omega_t))
                            elif wave == 'triangle':
                                val = c['val'] * (2.0 / np.pi) * np.arcsin(np.sin(omega_t))
                        
                        G[n1, extra_idx]+=1; G[n2, extra_idx]-=1; G[extra_idx, n1]+=1; G[extra_idx, n2]-=1
                        I[extra_idx] = val
                        extra_idx += 1
                        
                    elif c['type'] == 'Q':
                        nc, nb, ne = self.node_map[c['nc']], self.node_map[c['nb']], self.node_map[c['ne']]
                        vc = x[nc]; vb = x[nb]; ve = x[ne]
                        vbe = vb - ve; vbc = vb - vc
                        vbe = min(vbe, 2.0); vbc = min(vbc, 2.0)
                        
                        vt = c['Vt']; Is = c['Is']
                        alpha_f = c['alpha_f']; alpha_r = c['alpha_r']
                        
                        exp_be = np.exp(vbe/vt); exp_bc = np.exp(vbc/vt)
                        If = Is * (exp_be - 1); Ir = Is * (exp_bc - 1)
                        g_be = (Is / vt) * exp_be; g_bc = (Is / vt) * exp_bc
                        
                        # Jacobian Stamp
                        G[nb, nb] += (1-alpha_f)*g_be + (1-alpha_r)*g_bc
                        G[nb, ne] -= (1-alpha_f)*g_be
                        G[nb, nc] -= (1-alpha_r)*g_bc
                        
                        G[nc, nb] += alpha_f*g_be - g_bc
                        G[nc, nc] += g_bc
                        G[nc, ne] -= alpha_f*g_be
                        
                        G[ne, nb] += -g_be + alpha_r*g_bc
                        G[ne, ne] += g_be
                        G[ne, nc] -= alpha_r*g_bc
                        
                        Ib_val = (1-alpha_f)*If + (1-alpha_r)*Ir
                        Ic_val = alpha_f*If - Ir
                        Ie_val = -If + alpha_r*Ir
                        
                        I[nb] -= Ib_val - ((1-alpha_f)*g_be*vbe + (1-alpha_r)*g_bc*vbc)
                        I[nc] -= Ic_val - (alpha_f*g_be*vbe - g_bc*vbc)
                        I[ne] -= Ie_val - (-g_be*vbe + alpha_r*g_bc*vbc)

                    elif c['type'] == 'M': # MOSFET (Shichman-Hodges)
                        nd, ng, ns = self.node_map[c['nd']], self.node_map[c['ng']], self.node_map[c['ns']]
                        vd = x[nd]; vg = x[ng]; vs = x[ns]
                        vgs = vg - vs; vds = vd - vs
                        vt = c['vt']; k = c['k']
                        
                        ids = 0; gm = 0; gds = 0
                        
                        if vgs > vt:
                            if vds < (vgs - vt): # Linear
                                ids = k * ((vgs - vt)*vds - 0.5*vds**2)
                                gm = k * vds
                                gds = k * (vgs - vt - vds)
                            else: # Saturation
                                ids = 0.5 * k * (vgs - vt)**2
                                gm = k * (vgs - vt)
                                gds = 0
                        
                        G[nd, ng] += gm; G[nd, nd] += gds; G[nd, ns] -= (gm + gds)
                        G[ns, ng] -= gm; G[ns, nd] -= gds; G[ns, ns] += (gm + gds)
                        
                        ieq = ids - (gm * vgs + gds * vds)
                        I[nd] -= ieq; I[ns] += ieq

                    elif c['type'] == 'E': # OpAmp (VCVS)
                        n_plus, n_minus, n_out = self.node_map[c['n_plus']], self.node_map[c['n_minus']], self.node_map[c['n_out']]
                        gain = c['gain']
                        
                        G[extra_idx, n_plus] = 1; G[extra_idx, n_minus] = -1; G[extra_idx, n_out] = -1.0/gain
                        G[n_out, extra_idx] = 1
                        # I[extra_idx] = 0 (Ideal)
                        extra_idx += 1

                    elif c['type'] == 'T': # Transformer (Ideal)
                        p1, p2 = self.node_map[c['p1']], self.node_map[c['p2']]
                        s1, s2 = self.node_map[c['s1']], self.node_map[c['s2']]
                        n = c['ratio']
                        
                        # Constraint: V_s - n*V_p = 0
                        # V_s = s1-s2, V_p = p1-p2
                        # s1 - s2 - n*p1 + n*p2 = 0
                        
                        G[extra_idx, s1] = 1; G[extra_idx, s2] = -1
                        G[extra_idx, p1] = -n; G[extra_idx, p2] = n
                        
                        # Currents
                        G[p1, extra_idx] = n; G[p2, extra_idx] = -n
                        G[s1, extra_idx] = -1; G[s2, extra_idx] = 1
                        
                        extra_idx += 1

                    elif c['type'] == 'Logic': # Logic Gate
                        vals = [x[self.node_map[n]] for n in c['inputs']]
                        out_val = 0.0
                        threshold = 2.5; high = 5.0
                        
                        if c['kind'] == 'AND': out_val = high if all(v > threshold for v in vals) else 0.0
                        elif c['kind'] == 'OR': out_val = high if any(v > threshold for v in vals) else 0.0
                        elif c['kind'] == 'NAND': out_val = 0.0 if all(v > threshold for v in vals) else high
                        elif c['kind'] == 'NOT': out_val = 0.0 if vals[0] > threshold else high
                        elif c['kind'] == 'XOR':
                             b1 = vals[0] > threshold
                             b2 = vals[1] > threshold if len(vals)>1 else False
                             out_val = high if (b1 != b2) else 0.0
                        
                        n_out = self.node_map[c['n_out']]
                        g_logic = 1.0 / 10.0 # 10 ohm output impedance
                        G[n_out, n_out] += g_logic
                        I[n_out] += out_val * g_logic

                    elif c['type'] == 'FF': # FlipFlop Output
                        q_val = 5.0 if c['state']['Q'] == 1 else 0.0
                        q_bar_val = 5.0 - q_val
                        
                        n_q = self.node_map[c['outputs'][0]]
                        # n_qbar = self.node_map[c['outputs'][1]] # Handle if exists
                        
                        g_logic = 1.0 / 10.0
                        G[n_q, n_q] += g_logic
                        I[n_q] += q_val * g_logic
                        
                        if len(c['outputs']) > 1:
                            n_qbar = self.node_map[c['outputs'][1]]
                            G[n_qbar, n_qbar] += g_logic
                            I[n_qbar] += q_bar_val * g_logic

                    elif c['type'] == 'SR':
                        # Output is Bit 7 (Last bit)
                        out_val = 5.0 if c['state']['bits'][7] == 1 else 0.0
                        n_out = self.node_map[c['outputs'][0]]
                        g_logic = 1.0 / 10.0
                        G[n_out, n_out] += g_logic
                        I[n_out] += out_val * g_logic

                    # --- TRANSFORMER (MNA) ---
                    elif c['type'] == 'T':
                        # Already handled in extra_idx loop above, 
                        # but we need to ensure we don't double count if we moved it here.
                        # Wait, the transformer was handled in the 'components' loop.
                        # This section is inside 'components' loop too.
                        # The previous T block was correct.
                        pass


                v_idx = N
                
                # Build Matrix
                for c in self.components:
                    if c['type'] == 'R':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        g = 1.0 / (c['val'] + 1e-12)
                        G[n1,n1]+=g; G[n2,n2]+=g; G[n1,n2]-=g; G[n2,n1]-=g
                        
                    elif c['type'] == 'C':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        gc = c['val'] / dt
                        G[n1,n1]+=gc; G[n2,n2]+=gc; G[n1,n2]-=gc; G[n2,n1]-=gc
                        i_src = gc * c['v_prev']
                        I[n1] += i_src; I[n2] -= i_src
                        
                    elif c['type'] == 'L':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        gl = dt / (c['val'] + 1e-12)
                        G[n1,n1]+=gl; G[n2,n2]+=gl; G[n1,n2]-=gl; G[n2,n1]-=gl
                        I[n1] -= c['i_prev']; I[n2] += c['i_prev']
                        
                    elif c['type'] == 'V':
                        n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                        val = c['val']
                        if c['freq'] > 0:
                            omega_t = 2 * np.pi * c['freq'] * t
                            wave = c.get('wave', 'sine')
                            if wave == 'sine':
                                val = c['val'] * np.sin(omega_t)
                            elif wave == 'square':
                                val = c['val'] * np.sign(np.sin(omega_t))
                            elif wave == 'triangle':
                                val = c['val'] * (2.0 / np.pi) * np.arcsin(np.sin(omega_t))
                        
                        G[n1, v_idx]+=1; G[n2, v_idx]-=1; G[v_idx, n1]+=1; G[v_idx, n2]-=1
                        I[v_idx] = val
                        v_idx += 1
                        
                    elif c['type'] == 'Q':
                        nc, nb, ne = self.node_map[c['nc']], self.node_map[c['nb']], self.node_map[c['ne']]
                        # Current voltages
                        vc = x[nc]; vb = x[nb]; ve = x[ne]
                        vbe = vb - ve
                        vbc = vb - vc
                        
                        # Limit exponential to avoid overflow
                        vbe = min(vbe, 2.0); vbc = min(vbc, 2.0)
                        
                        vt = c['Vt']; Is = c['Is']
                        alpha_f = c['alpha_f']; alpha_r = c['alpha_r']
                        
                        # Ebers-Moll Currents
                        exp_be = np.exp(vbe/vt)
                        exp_bc = np.exp(vbc/vt)
                        
                        If = Is * (exp_be - 1)
                        Ir = Is * (exp_bc - 1)
                        
                        # Conductances
                        g_be = (Is / vt) * exp_be
                        g_bc = (Is / vt) * exp_bc
                        
                        # Jacobian Stamp (G)
                        # Base Row (nb)
                        G[nb, nb] += (1-alpha_f)*g_be + (1-alpha_r)*g_bc
                        G[nb, ne] -= (1-alpha_f)*g_be
                        G[nb, nc] -= (1-alpha_r)*g_bc
                        
                        # Collector Row (nc)
                        G[nc, nb] += alpha_f*g_be - g_bc
                        G[nc, nc] += g_bc
                        G[nc, ne] -= alpha_f*g_be
                        
                        # Emitter Row (ne)
                        G[ne, nb] += -g_be + alpha_r*g_bc
                        G[ne, ne] += g_be
                        G[ne, nc] -= alpha_r*g_bc
                        
                        # RHS Vector (I) - Newton Raphson: J*dx = -F  => J*x_new = J*x_old - F
                        # RHS = J*x - F (where F is current leaving node)
                        Ib_val = (1-alpha_f)*If + (1-alpha_r)*Ir
                        Ic_val = alpha_f*If - Ir
                        Ie_val = -If + alpha_r*Ir
                        
                        rhs_ib = Ib_val - ((1-alpha_f)*g_be*vbe + (1-alpha_r)*g_bc*vbc)
                        rhs_ic = Ic_val - (alpha_f*g_be*vbe - g_bc*vbc)
                        rhs_ie = Ie_val - (-g_be*vbe + alpha_r*g_bc*vbc)
                        
                        I[nb] -= rhs_ib
                        I[nc] -= rhs_ic
                        I[ne] -= rhs_ie

                # Ground handling
                if 0 in self.node_map:
                    idx0 = self.node_map[0]
                    G[idx0, :] = 0; G[idx0, idx0] = 1; I[idx0] = 0
                
                # Solve
                try:
                    x_new = np.linalg.solve(G, I)
                    # Check convergence
                    if np.max(np.abs(x_new - x)) < 1e-6:
                        x = x_new
                        break
                    x = x_new
                except:
                    break # Singular or fail
            
            # Store results
            for n in node_list:
                history[str(n)].append(float(x[self.node_map[n]]))
            history['time'].append(float(t))
            
            # Update dynamic memory
            for c in self.components:
                if c['type'] == 'C':
                    n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                    c['v_prev'] = x[n1] - x[n2]
                elif c['type'] == 'L':
                    n1, n2 = self.node_map[c['n1']], self.node_map[c['n2']]
                    v_diff = x[n1] - x[n2]
                    gl = dt / (c['val'] + 1e-12)
                    c['i_prev'] += gl * v_diff

        # --- POST-PROCESSING ANALYSIS (Engineering Metrics) ---
        analysis = {}
        for n in node_list:
            v_data = np.array(history[str(n)])
            # Skip first 10% to avoid initial transient for steady-state stats
            start_idx = int(len(v_data) * 0.1)
            v_steady = v_data[start_idx:]
            
            v_max = np.max(v_steady)
            v_min = np.min(v_steady)
            v_pp = v_max - v_min
            v_avg = np.mean(v_steady)
            v_rms = np.sqrt(np.mean(v_steady**2))
            
            # Simple Frequency Estimation (Zero crossings)
            # Remove DC offset
            v_ac = v_steady - v_avg
            zero_crossings = np.where(np.diff(np.signbit(v_ac)))[0]
            freq = 0
            if len(zero_crossings) > 1:
                # Average distance between crossings
                avg_period_indices = np.mean(np.diff(zero_crossings)) * 2 # *2 because 2 crossings per period
                period = avg_period_indices * dt
                if period > 0:
                    freq = 1.0 / period

            # --- SPECTRAL ANALYSIS (FFT) ---
            # Compute FFT using numpy
            N = len(v_steady)
            if N > 1:
                yf = np.fft.rfft(v_steady)
                xf = np.fft.rfftfreq(N, dt)
                
                # Magnitude (normalized)
                mag = np.abs(yf) * 2.0 / N
                mag[0] = mag[0] / 2.0 # Correct DC component scaling
                
                # Find peaks (Harmonics)
                # Simple peak detection: max val
                peak_idx = np.argmax(mag[1:]) + 1 # Ignore DC for peak freq
                dom_freq = xf[peak_idx]
                dom_mag = mag[peak_idx]
                
                # THD Calculation (Total Harmonic Distortion)
                # THD = sqrt(V_rms_ac^2 - V_rms_fund^2) / V_rms_fund
                thd = 0
                v_rms_fund = dom_mag / np.sqrt(2)
                
                # Calculate AC RMS (excluding DC)
                v_rms_ac = np.sqrt(np.mean(v_ac**2))
                
                if v_rms_fund > 1e-9:
                    p_dist = max(0, v_rms_ac**2 - v_rms_fund**2)
                    thd = (np.sqrt(p_dist) / v_rms_fund) * 100

                # Export spectrum (Top 50 points to save JSON size)
                # We can resample or just send raw if not too huge. 
                # Let's send a simplified spectrum for visualization.
                spectrum_data = []
                for i in range(len(xf)):
                     if i % 2 == 0: # Downsample factor 2
                        spectrum_data.append({"f": float(xf[i]), "m": float(mag[i])})
            else:
                spectrum_data = []
                thd = 0

            analysis[str(n)] = {
                "V_max": float(v_max),
                "V_min": float(v_min),
                "V_pp": float(v_pp),
                "V_avg": float(v_avg), # DC Component
                "V_rms": float(v_rms),
                "Freq": float(freq),
                "THD": float(thd),
                "Spectrum": spectrum_data # Array of {f, m}
            }

        return json.dumps({"history": history, "analysis": analysis})

c = Circuit()
${code}
c.solve_transient()
`;
      try {
          const res = await onRunSimulation(solverCode);
          // Parse JSON result from python stdout
          let data;
          try {
             data = JSON.parse(res);
          } catch(e) {
             // If parse fails, maybe it's just the old format or error
             // Try to find the last valid JSON line if mixed with prints
             const lines = res.trim().split('\n');
             data = JSON.parse(lines[lines.length-1]);
          }

          const history = data.history || data; // Fallback for backward compat
          const analysis = data.analysis || {};
          
          // Transform for Recharts
          // { time: [...], "1": [...], "2": [...] } -> [{time: t0, "1": v0, "2": v0}, ...]
          const chartData = history.time.map((t, i) => {
              const point = { time: t * 1000 }; // ms
              probes.forEach(p => {
                  if (history[p.net]) point[p.label] = history[p.net][i];
              });
              return point;
          });
          
          // Inject analysis data into the result string so ElectronicsLab can parse it
          // We can attach it to the data object if we were passing objects, but here we pass string/data via callback usually
          // But wait, ElectronicsLab calls this via onRunCode which returns string.
          // ElectronicsLab needs the FULL object.
          
          // We are returning chartData to local state, but ElectronicsLab expects 'data' via its own 'runPythonCode' logic?
          // Actually, 'SchematicEditor' calls 'onRunSimulation' which is 'runPythonCode' in 'ElectronicsLab'.
          // 'runPythonCode' returns the raw string result.
          // BUT 'ElectronicsLab' also parses it!
          
          // So if we change the JSON structure here, 'ElectronicsLab' needs to know.
          
          setSimData(chartData);
          setSimResult(useCluster ? "Simulación completada en Cluster (12 Nodos) 🚀" : "Simulación completada.");
          
      } catch (e) {
          setSimResult("Error en simulación: " + e.message);
      } finally {
          setSimStatus('idle');
      }
  };

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* EDITOR AREA */}
      <div className="w-full h-[500px] flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 relative">
        <div className="bg-gray-800 p-2 flex gap-2 border-b border-gray-700 overflow-x-auto items-center">
            <span className="text-xs font-bold text-gray-400">BASIC:</span>
            <button onClick={() => addComponent('resistor')} className="btn-tool">Resistencia</button>
            <button onClick={() => addComponent('capacitor')} className="btn-tool">Capacitor</button>
            <button onClick={() => addComponent('inductor')} className="btn-tool">Bobina</button>
            <button onClick={() => addComponent('source')} className="btn-tool">Fuente</button>
            <button onClick={() => addComponent('gnd')} className="btn-tool">GND</button>
            
            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <span className="text-xs font-bold text-gray-400">ACTIVE:</span>
            <button onClick={() => addComponent('transistor')} className="btn-tool text-cyan-400 border-cyan-400">BJT</button>
            <button onClick={() => addComponent('mosfet')} className="btn-tool text-cyan-400 border-cyan-400">MOSFET</button>
            <button onClick={() => addComponent('opamp')} className="btn-tool text-cyan-400 border-cyan-400">OpAmp</button>
            <button onClick={() => addComponent('transformer')} className="btn-tool text-yellow-400 border-yellow-400">Trafo</button>

            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <span className="text-xs font-bold text-gray-400">DIGITAL:</span>
            <div className="flex flex-col gap-0.5">
                <div className="flex gap-1">
                    <button onClick={() => addComponent('logic', 'AND')} className="btn-tool text-green-400 text-[9px] px-1">AND</button>
                    <button onClick={() => addComponent('logic', 'OR')} className="btn-tool text-green-400 text-[9px] px-1">OR</button>
                    <button onClick={() => addComponent('logic', 'NOT')} className="btn-tool text-green-400 text-[9px] px-1">NOT</button>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => addComponent('logic', 'NAND')} className="btn-tool text-green-400 text-[9px] px-1">NAND</button>
                    <button onClick={() => addComponent('logic', 'XOR')} className="btn-tool text-green-400 text-[9px] px-1">XOR</button>
                </div>
            </div>
            <button onClick={() => addComponent('flipflop')} className="btn-tool text-purple-400">FlipFlop</button>
            <button onClick={() => addComponent('shiftreg')} className="btn-tool text-purple-400">ShiftReg</button>
            <button onClick={() => addComponent('karnaugh')} className="btn-tool text-purple-400">K-Map</button>

            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <button onClick={() => addComponent('scope')} className="btn-tool !border-cyan-700 !text-cyan-400">Probe</button>
            <button onClick={deleteSelected} className="btn-tool text-red-400 border-red-800 hover:bg-red-900/50 ml-2">🗑️</button>
            <button onClick={rotateSelected} className="btn-tool text-yellow-300 border-yellow-600 ml-2">↻</button>
            <button onClick={mirrorSelected} className="btn-tool text-pink-300 border-pink-600 ml-2">⇄</button>
            <button onClick={toggleLineType} className="btn-tool text-blue-300 border-blue-300 ml-2">
                {isEngineeringLines ? '↱' : '∿'}
            </button>
            
            <div className="flex-grow"></div>
            <button onClick={saveLocal} className="btn-tool text-green-400 border-green-400">💾</button>
            <label className="btn-tool cursor-pointer text-yellow-300 border-yellow-300">
              📂
              <input type="file" accept="application/json" onChange={loadLocal} className="hidden" />
            </label>
            <button onClick={exportNetlist} className="btn-tool text-purple-400 border-purple-400">Export</button>
            <button onClick={toggleNetlist} className="btn-tool text-orange-400 border-orange-400">Netlist</button>
            
            <button 
                onClick={handleSimulate}
                disabled={simStatus === 'running'}
                className={`px-4 py-1 text-white text-xs font-bold rounded flex items-center gap-1 ${simStatus === 'running' ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]'}`}
            >
                {simStatus === 'running' ? '⌛' : '▶ RUN'}
            </button>
        </div>

        <div className="flex-grow relative">
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            connectionLineType={isEngineeringLines ? ConnectionLineType.Step : ConnectionLineType.Bezier}
            connectionMode={ConnectionMode.Loose}
            fitView
            >
            <Background color="#222" gap={16} />
            <Controls />
            <MiniMap style={{background: '#111'}} nodeColor={() => '#444'} />
            </ReactFlow>
        </div>
      </div>

      {/* RESULTS AREA */}
      {simData.length > 0 && (
          <div className="w-full h-[300px] bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-green-400 text-sm font-bold mb-2">Osciloscopio (Resultados Transitorios)</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" stroke="#888" label={{ value: 'Tiempo (ms)', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis stroke="#888" label={{ value: 'Voltaje (V)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#555' }} />
                      <Legend />
                      {Object.keys(simData[0] || {}).filter(k => k !== 'time').map((k, i) => (
                          <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} dot={false} strokeWidth={2} />
                      ))}
                  </LineChart>
              </ResponsiveContainer>
          </div>
      )}
      
      {simResult && typeof simResult === 'string' && !simData.length && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-400 rounded text-xs font-mono whitespace-pre-wrap">
              {simResult}
          </div>
      )}

      <style jsx>{`
        .btn-tool {
            @apply px-2 py-1 bg-gray-700/50 text-gray-300 text-[10px] border border-gray-600 rounded hover:bg-gray-600 transition-colors whitespace-nowrap;
        }
      `}</style>
    </div>
  );
};

export default SchematicEditor;
c.solve_transient()
`;
      try {
          const res = await onRunSimulation(solverCode);
          // Parse JSON result from python stdout
          let data;
          try {
             data = JSON.parse(res);
          } catch(e) {
             // If parse fails, maybe it's just the old format or error
             // Try to find the last valid JSON line if mixed with prints
             const lines = res.trim().split('\n');
             data = JSON.parse(lines[lines.length-1]);
          }

          const history = data.history || data; // Fallback for backward compat
          const analysis = data.analysis || {};
          
          // Transform for Recharts
          // { time: [...], "1": [...], "2": [...] } -> [{time: t0, "1": v0, "2": v0}, ...]
          const chartData = history.time.map((t, i) => {
              const point = { time: t * 1000 }; // ms
              probes.forEach(p => {
                  if (history[p.net]) point[p.label] = history[p.net][i];
              });
              return point;
          });
          
          // Inject analysis data into the result string so ElectronicsLab can parse it
          // We can attach it to the data object if we were passing objects, but here we pass string/data via callback usually
          // But wait, ElectronicsLab calls this via onRunCode which returns string.
          // ElectronicsLab needs the FULL object.
          
          // We are returning chartData to local state, but ElectronicsLab expects 'data' via its own 'runPythonCode' logic?
          // Actually, 'SchematicEditor' calls 'onRunSimulation' which is 'runPythonCode' in 'ElectronicsLab'.
          // 'runPythonCode' returns the raw string result.
          // BUT 'ElectronicsLab' also parses it!
          
          // So if we change the JSON structure here, 'ElectronicsLab' needs to know.
          
          setSimData(chartData);
          setSimResult(useCluster ? "Simulación completada en Cluster (12 Nodos) 🚀" : "Simulación completada.");
          
      } catch (e) {
          setSimResult("Error en simulación: " + e.message);
      } finally {
          setSimStatus('idle');
      }
  };

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* EDITOR AREA */}
      <div className="w-full h-[500px] flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900 relative">
        <div className="bg-gray-800 p-2 flex gap-2 border-b border-gray-700 overflow-x-auto items-center">
            <span className="text-xs font-bold text-gray-400">BASIC:</span>
            <button onClick={() => addComponent('resistor')} className="btn-tool">Resistencia</button>
            <button onClick={() => addComponent('capacitor')} className="btn-tool">Capacitor</button>
            <button onClick={() => addComponent('inductor')} className="btn-tool">Bobina</button>
            <button onClick={() => addComponent('source')} className="btn-tool">Fuente</button>
            <button onClick={() => addComponent('gnd')} className="btn-tool">GND</button>
            
            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <span className="text-xs font-bold text-gray-400">ACTIVE:</span>
            <button onClick={() => addComponent('transistor')} className="btn-tool text-cyan-400 border-cyan-400">BJT</button>
            <button onClick={() => addComponent('mosfet')} className="btn-tool text-cyan-400 border-cyan-400">MOSFET</button>
            <button onClick={() => addComponent('opamp')} className="btn-tool text-cyan-400 border-cyan-400">OpAmp</button>
            <button onClick={() => addComponent('transformer')} className="btn-tool text-yellow-400 border-yellow-400">Trafo</button>

            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <span className="text-xs font-bold text-gray-400">DIGITAL:</span>
            <div className="flex flex-col gap-0.5">
                <div className="flex gap-1">
                    <button onClick={() => addComponent('logic', 'AND')} className="btn-tool text-green-400 text-[9px] px-1">AND</button>
                    <button onClick={() => addComponent('logic', 'OR')} className="btn-tool text-green-400 text-[9px] px-1">OR</button>
                    <button onClick={() => addComponent('logic', 'NOT')} className="btn-tool text-green-400 text-[9px] px-1">NOT</button>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => addComponent('logic', 'NAND')} className="btn-tool text-green-400 text-[9px] px-1">NAND</button>
                    <button onClick={() => addComponent('logic', 'XOR')} className="btn-tool text-green-400 text-[9px] px-1">XOR</button>
                </div>
            </div>
            <button onClick={() => addComponent('flipflop')} className="btn-tool text-purple-400">FlipFlop</button>
            <button onClick={() => addComponent('shiftreg')} className="btn-tool text-purple-400">ShiftReg</button>
            <button onClick={() => addComponent('karnaugh')} className="btn-tool text-purple-400">K-Map</button>

            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <button onClick={() => addComponent('scope')} className="btn-tool !border-cyan-700 !text-cyan-400">Probe</button>
            <button onClick={deleteSelected} className="btn-tool text-red-400 border-red-800 hover:bg-red-900/50 ml-2">🗑️</button>
            <button onClick={rotateSelected} className="btn-tool text-yellow-300 border-yellow-600 ml-2">↻</button>
            <button onClick={mirrorSelected} className="btn-tool text-pink-300 border-pink-600 ml-2">⇄</button>
            <button onClick={toggleLineType} className="btn-tool text-blue-300 border-blue-300 ml-2">
                {isEngineeringLines ? '↱' : '∿'}
            </button>
            
            <div className="flex-grow"></div>
            <button onClick={saveLocal} className="btn-tool text-green-400 border-green-400">💾</button>
            <label className="btn-tool cursor-pointer text-yellow-300 border-yellow-300">
              📂
              <input type="file" accept="application/json" onChange={loadLocal} className="hidden" />
            </label>
            <button onClick={exportNetlist} className="btn-tool text-purple-400 border-purple-400">Export</button>
            
            <button 
                onClick={handleSimulate}
                disabled={simStatus === 'running'}
                className={`px-4 py-1 text-white text-xs font-bold rounded flex items-center gap-1 ${simStatus === 'running' ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]'}`}
            >
                {simStatus === 'running' ? '⌛' : '▶ RUN'}
            </button>
        </div>

        <div className="flex-grow relative">
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            connectionLineType={isEngineeringLines ? ConnectionLineType.Step : ConnectionLineType.Bezier}
            connectionMode={ConnectionMode.Loose}
            fitView
            >
            <Background color="#222" gap={16} />
            <Controls />
            <MiniMap style={{background: '#111'}} nodeColor={() => '#444'} />
            </ReactFlow>
        </div>
      </div>

      {/* RESULTS AREA */}
      {simData.length > 0 && (
          <div className="w-full h-[300px] bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-green-400 text-sm font-bold mb-2">Osciloscopio (Resultados Transitorios)</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" stroke="#888" label={{ value: 'Tiempo (ms)', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis stroke="#888" label={{ value: 'Voltaje (V)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#555' }} />
                      <Legend />
                      {Object.keys(simData[0] || {}).filter(k => k !== 'time').map((k, i) => (
                          <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} dot={false} strokeWidth={2} />
                      ))}
                  </LineChart>
              </ResponsiveContainer>
          </div>
      )}
      
      {simResult && typeof simResult === 'string' && !simData.length && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-400 rounded text-xs font-mono whitespace-pre-wrap">
              {simResult}
          </div>
      )}

      <style jsx>{`
        .btn-tool {
            @apply px-2 py-1 bg-gray-700/50 text-gray-300 text-[10px] border border-gray-600 rounded hover:bg-gray-600 transition-colors whitespace-nowrap;
        }
      `}</style>
    </div>
  );
};

export default SchematicEditor;
