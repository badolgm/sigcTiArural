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
  ConnectionMode
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
            </svg>
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

const SchematicEditor = ({ onRunSimulation }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [simResult, setSimResult] = useState(null);
  const [simData, setSimData] = useState([]); // For graphs
  const [simStatus, setSimStatus] = useState('idle');
  const [isEngineeringLines, setIsEngineeringLines] = useState(false); // Toggle line type

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

  const onConnect = useCallback((params) => {
      const type = isEngineeringLines ? 'step' : 'default';
      setEdges((eds) => addEdge({ ...params, type }, eds));
  }, [setEdges, isEngineeringLines]);

  // --- ADD COMPONENT ---
  const addComponent = (type) => {
    const id = `${type}_${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: 200, y: 200 },
      data: { 
        label: type.charAt(0).toUpperCase() + type.slice(1), 
        value: type === 'resistor' ? '1k' : type === 'capacitor' ? '1uF' : type === 'inductor' ? '1mH' : '10V',
        type: type === 'source' ? 'dc' : undefined
      },
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
    } else if (node.type === 'source') {
        const newVolt = window.prompt(`Amplitud de Voltaje (V) para ${node.data.label}:`, parseFloat(node.data.value) || 0);
        if (newVolt !== null) {
            let newFreq = 0;
            if (node.data.type === 'ac') {
                const f = window.prompt(`Frecuencia (Hz):`, node.data.freq || 60);
                newFreq = parseFloat(f) || 60;
            }
            
            setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) {
                    const displayVal = node.data.type === 'ac' ? `${newVolt}V, ${newFreq}Hz` : `${newVolt}V`;
                    return { ...n, data: { ...n.data, value: displayVal, volt: parseFloat(newVolt), freq: newFreq } };
                }
                return n;
            }));
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
        } else if (n.type === 'source') {
            const freq = n.data.freq !== undefined ? n.data.freq : (n.data.type === 'ac' ? 60 : 0); 
            lines.push(`c.add_voltage("${name}", ${getHandleNet(n.id, 'pos')}, ${getHandleNet(n.id, 'neg')}, ${val}, ${freq})`);
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

    def add_voltage(self, name, n1, n2, val, freq=0):
        self.components.append({'type':'V', 'name':name, 'n1':n1, 'n2':n2, 'val':val, 'freq':freq})
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

    def solve_transient(self, t_end=0.05, dt=1e-4):
        node_list = sorted(list(self.nodes))
        self.node_map = {n:i for i,n in enumerate(node_list)} 
        N = len(node_list)
        v_sources = [c for c in self.components if c['type']=='V']
        M = len(v_sources)
        dim = N + M
        
        times = np.arange(0, t_end, dt)
        history = {str(n): [] for n in node_list}
        history['time'] = []
        
        # Initial guess for voltages (0)
        x = np.zeros(dim)
        
        for t in times:
            # Newton-Raphson Iteration (Max 20 iter per step)
            for iter in range(20):
                G = np.zeros((dim, dim))
                I = np.zeros(dim)
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
                        if c['freq'] > 0: val = c['val'] * np.sin(2 * np.pi * c['freq'] * t)
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
            <span className="text-xs font-bold text-gray-400">COMPONENTES:</span>
            <button onClick={() => addComponent('resistor')} className="btn-tool">Resistencia</button>
            <button onClick={() => addComponent('capacitor')} className="btn-tool">Capacitor</button>
            <button onClick={() => addComponent('inductor')} className="btn-tool">Bobina</button>
            <button onClick={() => addComponent('transistor')} className="btn-tool text-cyan-400 border-cyan-400">Transistor NPN</button>
            <button onClick={() => addComponent('source')} className="btn-tool">Fuente AC/DC</button>
            <button onClick={() => addComponent('gnd')} className="btn-tool">Tierra (GND)</button>
            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <button onClick={() => addComponent('scope')} className="btn-tool !border-cyan-700 !text-cyan-400">Probe</button>
            <button onClick={deleteSelected} className="btn-tool text-red-400 border-red-800 hover:bg-red-900/50 ml-2">🗑️ Eliminar</button>
            <button onClick={rotateSelected} className="btn-tool text-yellow-300 border-yellow-600 ml-2" title="Rotar componente seleccionado 90°">↻ Rotar</button>
            <button onClick={mirrorSelected} className="btn-tool text-pink-300 border-pink-600 ml-2" title="Espejo horizontal (Flip)">⇄ Espejo</button>
            <button onClick={toggleLineType} className="btn-tool text-blue-300 border-blue-300 ml-2" title="Alternar estilo de conexión">
                {isEngineeringLines ? '↱ Rectas' : '∿ Curvas'}
            </button>
            <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
            <button onClick={saveLocal} className="btn-tool text-green-400 border-green-400">Guardar Diseño</button>
            <label className="btn-tool cursor-pointer text-yellow-300 border-yellow-300">
              Cargar Diseño
              <input type="file" accept="application/json" onChange={loadLocal} className="hidden" />
            </label>
            <button onClick={exportNetlist} className="btn-tool text-purple-400 border-purple-400">Exportar Netlist</button>
            
            <div className="flex-grow"></div>
            <button 
                onClick={handleSimulate}
                disabled={simStatus === 'running'}
                className={`px-4 py-1 text-white text-xs font-bold rounded flex items-center gap-1 ${simStatus === 'running' ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]'}`}
            >
                {simStatus === 'running' ? '⌛ Simulando...' : '▶ SIMULAR'}
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
