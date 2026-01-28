import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLabStore } from '../stores/useLabStore';

// --- CUSTOM NODE COMPONENTS ---

// 1. Fuente de Voltaje (AC/DC)
const SourceNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs mb-1">
          {data.type === 'ac' ? '~' : '+-'}
        </div>
        <div className="text-xs font-bold text-gray-700">{data.label}</div>
        <div className="text-[10px] text-gray-500">{data.value}</div>
      </div>
      <Handle type="source" position={Position.Top} id="pos" className="w-2 h-2 !bg-red-500" />
      <Handle type="source" position={Position.Bottom} id="neg" className="w-2 h-2 !bg-blue-500" />
    </div>
  );
};

// 2. Resistencia
const ResistorNode = ({ data }) => {
  return (
    <div className="px-2 py-1 shadow-sm rounded bg-amber-50 border border-amber-200 w-24">
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex flex-col items-center">
        {/* Símbolo ZigZag CSS simplificado */}
        <div className="w-12 h-4 border-b-2 border-dashed border-gray-600 mb-1"></div>
        <div className="text-xs font-bold text-amber-900">{data.label}</div>
        <div className="text-[10px] text-amber-700">{data.value}</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

// 3. Transistor NPN
const TransistorNode = ({ data }) => {
  return (
    <div className="px-2 py-2 shadow-md rounded bg-white border border-gray-300 w-20">
      <Handle type="target" position={Position.Left} id="base" className="!bg-green-500 top-1/2" />
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center text-[10px] bg-gray-50">
          Q
        </div>
        <div className="text-xs mt-1">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Top} id="collector" className="!bg-red-500" />
      <Handle type="source" position={Position.Bottom} id="emitter" className="!bg-blue-500" />
    </div>
  );
};

// 4. Osciloscopio (Probe)
const ScopeNode = ({ data }) => {
  const electronicsData = useLabStore((state) => state.electronicsData);
  const active = electronicsData?.active;
  
  return (
    <div className="px-2 py-2 shadow-[0_0_10px_#00ffff] rounded bg-black border border-cyan-500 min-w-[120px]">
      <Handle type="target" position={Position.Left} className="!bg-cyan-400" />
      <div className="text-cyan-400 font-mono text-xs mb-1">📟 {data.label}</div>
      <div className="h-12 bg-gray-900 rounded relative overflow-hidden">
         {/* Mini visualización de señal si está activo */}
         {active ? (
           <svg className="w-full h-full" preserveAspectRatio="none">
             <path d="M0,24 Q30,4 60,24 T120,24" fill="none" stroke="#39FF14" strokeWidth="2" />
           </svg>
         ) : (
           <div className="flex items-center justify-center h-full text-[8px] text-gray-600">SIN SEÑAL</div>
         )}
      </div>
    </div>
  );
};

// 5. Capacitor
const CapacitorNode = ({ data }) => {
  return (
    <div className="px-2 py-1 shadow-sm rounded bg-blue-50 border border-blue-200 w-16">
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex flex-col items-center">
        <div className="flex gap-1 items-center h-6">
          <div className="w-1 h-4 bg-gray-600"></div>
          <div className="w-1 h-4 bg-gray-600"></div>
        </div>
        <div className="text-[10px] font-bold text-blue-900">{data.label}</div>
        <div className="text-[8px] text-blue-700">{data.value}</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

// 6. Inductor (Bobina)
const InductorNode = ({ data }) => {
  return (
    <div className="px-2 py-1 shadow-sm rounded bg-indigo-50 border border-indigo-200 w-20">
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex flex-col items-center">
        {/* Símbolo de bobina simplificado */}
        <div className="flex">
          <div className="w-3 h-3 border-t-2 border-r-2 border-gray-600 rounded-full"></div>
          <div className="w-3 h-3 border-t-2 border-r-2 border-gray-600 rounded-full -ml-1"></div>
          <div className="w-3 h-3 border-t-2 border-r-2 border-gray-600 rounded-full -ml-1"></div>
        </div>
        <div className="text-[10px] font-bold text-indigo-900">{data.label}</div>
        <div className="text-[8px] text-indigo-700">{data.value}</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

// 7. Diodo
const DiodeNode = ({ data }) => {
  return (
    <div className="px-2 py-1 shadow-sm rounded bg-gray-50 border border-gray-300 w-16">
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex flex-col items-center">
         <div className="text-lg font-bold leading-none text-gray-700">➜|</div>
        <div className="text-[10px] font-bold text-gray-900">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

const nodeTypes = {
  source: SourceNode,
  resistor: ResistorNode,
  transistor: TransistorNode,
  scope: ScopeNode,
  capacitor: CapacitorNode,
  inductor: InductorNode,
  diode: DiodeNode
};

// --- INITIAL NODES (Ejemplo Emisor Común) ---
const initialNodes = [
  { id: 'v1', type: 'source', position: { x: 50, y: 100 }, data: { type: 'ac', label: 'Vin', value: '1kHz 100mV' } },
  { id: 'c1', type: 'capacitor', position: { x: 140, y: 100 }, data: { label: 'Cin', value: '10uF' } },
  { id: 'r1', type: 'resistor', position: { x: 240, y: 50 }, data: { label: 'Rb', value: '10kΩ' } },
  { id: 'q1', type: 'transistor', position: { x: 350, y: 100 }, data: { label: '2N2222' } },
  { id: 'r2', type: 'resistor', position: { x: 350, y: 10 }, data: { label: 'Rc', value: '1kΩ' } },
  { id: 'vcc', type: 'source', position: { x: 350, y: -80 }, data: { type: 'dc', label: 'Vcc', value: '12V' } },
  { id: 'd1', type: 'diode', position: { x: 450, y: 100 }, data: { label: 'D1' } },
  { id: 'scope1', type: 'scope', position: { x: 550, y: 80 }, data: { label: 'Vout' } },
];

const initialEdges = [
  { id: 'e1', source: 'v1', target: 'c1' },
  { id: 'e1-2', source: 'c1', target: 'r1' },
  { id: 'e2', source: 'r1', target: 'q1', targetHandle: 'base' },
  { id: 'e3', source: 'vcc', target: 'r2' },
  { id: 'e4', source: 'r2', target: 'q1', targetHandle: 'collector' },
  { id: 'e4-5', source: 'q1', sourceHandle: 'collector', target: 'd1' },
  { id: 'e5', source: 'd1', target: 'scope1' },
];

const SchematicEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Función para añadir componentes (Drag & Drop simulado por click por ahora)
  const addComponent = (type) => {
    const id = `${type}-${nodes.length + 1}`;
    const newNode = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: type.toUpperCase(), value: '?' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="w-full h-[600px] flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      {/* TOOLBAR */}
      <div className="bg-gray-800 p-2 flex gap-2 border-b border-gray-700 overflow-x-auto items-center">
        <span className="text-xs font-bold text-gray-500 mr-2">COMPONENTES:</span>
        <button onClick={() => addComponent('resistor')} className="px-2 py-1 bg-amber-900/30 text-amber-200 text-[10px] border border-amber-700/50 rounded hover:bg-amber-800">
          Resistencia
        </button>
        <button onClick={() => addComponent('capacitor')} className="px-2 py-1 bg-blue-900/30 text-blue-200 text-[10px] border border-blue-700/50 rounded hover:bg-blue-800">
          Capacitor
        </button>
        <button onClick={() => addComponent('inductor')} className="px-2 py-1 bg-indigo-900/30 text-indigo-200 text-[10px] border border-indigo-700/50 rounded hover:bg-indigo-800">
          Bobina
        </button>
        <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
        <button onClick={() => addComponent('diode')} className="px-2 py-1 bg-gray-700 text-gray-200 text-[10px] border border-gray-500 rounded hover:bg-gray-600">
          Diodo
        </button>
        <button onClick={() => addComponent('transistor')} className="px-2 py-1 bg-green-900/30 text-green-200 text-[10px] border border-green-700/50 rounded hover:bg-green-800">
          Transistor
        </button>
        <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
        <button onClick={() => addComponent('source')} className="px-2 py-1 bg-red-900/30 text-red-200 text-[10px] border border-red-700/50 rounded hover:bg-red-800">
          Fuente
        </button>
        <button onClick={() => addComponent('scope')} className="px-2 py-1 bg-cyan-900/30 text-cyan-200 text-[10px] border border-cyan-700/50 rounded hover:bg-cyan-800">
          Osciloscopio
        </button>
      </div>

      {/* CANVAS */}
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#222" gap={16} />
          <Controls />
          <MiniMap style={{background: '#111'}} nodeColor={() => '#00ffff'} />
        </ReactFlow>
        
        <div className="absolute bottom-4 right-4 bg-black/80 p-3 rounded border border-yellow-500/50 text-yellow-500 text-xs max-w-xs">
          ⚠️ <b>Modo Diseño (Experimental)</b><br/>
          Arrastra nodos para conectar. <br/>
          La simulación física usa el modelo matemático v3.0 (Python).
        </div>
      </div>
    </div>
  );
};

export default SchematicEditor;
