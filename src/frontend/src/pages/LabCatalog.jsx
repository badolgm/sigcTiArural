import React, { useState } from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  quantum: '#ff3cc7',
  darkBackground: '#0a0a0a',
};

const categories = [
  {
    title: 'Robótica',
    accent: '#00e5ff',
    icon: '🤖',
    links: [
      { label: 'ROS Wiki', href: 'http://wiki.ros.org/' },
      { label: 'Open Robotics', href: 'https://www.openrobotics.org/' },
      { label: 'Docs ROS2 (Humble)', href: 'https://docs.ros.org/en/humble/' },
      { label: 'Gazebo Simulator', href: 'https://gazebosim.org/' },
    ],
  },
  {
    title: 'Sistemas Embebidos',
    accent: '#a3ff12',
    icon: '⚡',
    links: [
      { label: 'BeagleBoard.org', href: 'https://beagleboard.org/' },
      { label: 'BeagleBone Black', href: 'https://beagleboard.org/black' },
      { label: 'Zephyr RTOS', href: 'https://zephyrproject.org/' },
      { label: 'Yosys (FPGA)', href: 'https://yosyshq.net/yosys/' },
      { label: 'Arduino IDE', href: 'https://www.arduino.cc/en/software' },
    ],
  },
  {
    title: 'Matemáticas Avanzadas',
    accent: '#ff3cc7',
    icon: '∫',
    isExpanded: true,
    sections: [
      {
        title: 'Laboratorio Cuántico - Nivel Fácil',
        accent: '#ff6b9d',
        links: [
          { label: '🧮 Lab Matemáticas Interactivo', href: '/labs/advanced-math', internal: true },
          { label: 'Qiskit Textbook', href: 'https://qiskit.org/textbook/' },
          { label: 'Quantum Computing Playground', href: 'http://www.quantumplayground.net/' },
          { label: 'IBM Quantum Experience', href: 'https://quantum-computing.ibm.com/' },
        ],
      },
      {
        title: 'Laboratorio Cuántico - Nivel Moderado',
        accent: '#c44569',
        links: [
          { label: 'Cirq (Google Quantum)', href: 'https://quantumai.google/cirq' },
          { label: 'PennyLane Quantum ML', href: 'https://pennylane.ai/' },
          { label: 'Microsoft Q# Dev Kit', href: 'https://azure.microsoft.com/en-us/products/quantum' },
          { label: 'Quantum Algorithms', href: 'https://github.com/microsoft/QuantumKatas' },
        ],
      },
      {
        title: 'Laboratorio Cuántico - Nivel Difícil',
        accent: '#8b0000',
        links: [
          { label: 'Quantum Fourier Transform', href: 'https://qiskit.org/textbook/ch-algorithms/quantum-fourier-transform.html' },
          { label: 'Variational Quantum Eigensolver', href: 'https://qiskit.org/textbook/ch-applications/vqe-molecules.html' },
          { label: 'Quantum Machine Learning', href: 'https://pennylane.ai/qml/' },
          { label: 'Tensor Networks', href: 'https://tensornetwork.org/' },
        ],
      },
      {
        title: 'Ecuaciones Diferenciales',
        accent: '#ff9ff3',
        links: [
          { label: 'MIT 18.03 Diff Equations', href: 'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/' },
          { label: 'SciPy ODE Solver', href: 'https://docs.scipy.org/doc/scipy/reference/integrate.html' },
          { label: 'Wolfram Alpha DE', href: 'https://www.wolframalpha.com/examples/mathematics/differential-equations' },
          { label: 'MATLAB ODE Suite', href: 'https://www.mathworks.com/help/matlab/ordinary-differential-equations.html' },
        ],
      },
      {
        title: 'Variable Compleja & Análisis',
        accent: '#f368e0',
        links: [
          { label: 'Complex Analysis (MIT)', href: 'https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/' },
          { label: 'Conformal Mapping', href: 'https://mathworld.wolfram.com/ConformalMapping.html' },
          { label: 'Residue Calculator', href: 'https://www.symbolab.com/solver/complex-analysis-calculator' },
          { label: 'Complex Function Grapher', href: 'https://www.geogebra.org/m/qmjbkjpq' },
        ],
      },
      {
        title: 'Álgebra Lineal & Multilineal',
        accent: '#ff6348',
        links: [
          { label: 'Linear Algebra (MIT 18.06)', href: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/' },
          { label: 'NumPy Linear Algebra', href: 'https://numpy.org/doc/stable/reference/routines.linalg.html' },
          { label: 'Eigenvalue Calculator', href: 'https://www.symbolab.com/solver/matrix-eigenvalues-calculator' },
          { label: 'Matrix Decompositions', href: 'https://mathworld.wolfram.com/MatrixDecomposition.html' },
        ],
      },
      {
        title: 'Tensores & Geometría',
        accent: '#ffa502',
        links: [
          { label: 'Tensor Calculus (MIT)', href: 'https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/' },
          { label: 'TensorFlow Tensors', href: 'https://www.tensorflow.org/guide/tensor' },
          { label: 'Differential Geometry', href: 'https://mathworld.wolfram.com/DifferentialGeometry.html' },
          { label: 'Riemannian Geometry', href: 'https://en.wikipedia.org/wiki/Riemannian_geometry' },
        ],
      },
      {
        title: 'Transformadas & Señales',
        accent: '#3742fa',
        links: [
          { label: 'Fourier Transform (MIT)', href: 'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/resources/fourier-series/' },
          { label: 'FFT Python Implementation', href: 'https://docs.scipy.org/doc/scipy/reference/fft.html' },
          { label: 'Laplace Transform', href: 'https://www.symbolab.com/solver/laplace-transform-calculator' },
          { label: 'Wavelet Transform', href: 'https://pywavelets.readthedocs.io/' },
        ],
      },
      {
        title: 'Lógica & Teoría de Conjuntos',
        accent: '#2ed573',
        links: [
          { label: 'Set Theory (Stanford)', href: 'https://plato.stanford.edu/entries/set-theory/' },
          { label: 'Mathematical Logic', href: 'https://ocw.mit.edu/courses/18-510-introduction-to-mathematical-logic-and-set-theory-fall-2006/' },
          { label: 'Proof Assistant (Lean)', href: 'https://leanprover.github.io/' },
          { label: 'Category Theory', href: 'https://bartoszmilewski.com/2014/10/28/category-theory-for-programmers-the-preface/' },
        ],
      },
    ],
  },
  {
    title: 'Telecomunicaciones',
    accent: '#00e5ff',
    icon: '📡',
    links: [
      { label: 'GNU Radio', href: 'https://www.gnuradio.org/' },
      { label: 'Start with GNU Radio', href: 'https://wiki.gnuradio.org/index.php/Start' },
      { label: 'ITU Standards', href: 'https://www.itu.int/' },
      { label: 'SDR Academy', href: 'https://www.sdrplay.com/sdr-academy/' },
    ],
  },
  {
    title: 'Agricultura + IA',
    accent: '#39FF14',
    icon: '🌱',
    links: [
      { label: 'FAO Digital Agriculture', href: 'https://www.fao.org/digital-agriculture' },
      { label: 'TensorFlow Lite', href: 'https://www.tensorflow.org/lite' },
      { label: 'OpenDroneMap', href: 'https://www.opendronemap.org/' },
      { label: 'PlantNet', href: 'https://plantnet.org/' },
    ],
  },
  {
    title: 'SENA y Universidades',
    accent: '#ff6b9d',
    icon: '🎓',
    links: [
      { label: 'SENA', href: 'https://www.sena.edu.co/' },
      { label: 'SOFIA Plus', href: 'https://oferta.senasofiaplus.edu.co/sofia-oferta/' },
      { label: 'Universidad Nacional', href: 'https://unal.edu.co/' },
      { label: 'Universidad de los Andes', href: 'https://uniandes.edu.co/' },
    ],
  },
];

const SubSection = ({ title, accent, links }) => (
  <div className="mb-4 p-3 rounded-lg border border-opacity-30" style={{ borderColor: accent }}>
    <h4 className="text-sm font-semibold mb-2 uppercase" style={{ color: accent, textShadow: `0 0 4px ${accent}60` }}>
      {title}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.internal ? '_self' : '_blank'}
          rel={l.internal ? '' : 'noreferrer'}
          className="px-2 py-1 text-xs rounded border transition-all duration-200 hover:scale-105"
          style={{ 
            borderColor: `${accent}40`, 
            color: '#e6edf3',
            backgroundColor: `${accent}10`
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  </div>
);

const Card = ({ title, accent, links, sections, icon, isExpanded }) => {
  const [expanded, setExpanded] = useState(isExpanded || false);
  
  return (
    <div
      className="card-float rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{ 
        boxShadow: `0 0 8px ${accent}40`, 
        borderColor: `${accent}50`,
        border: `1px solid ${accent}30`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-lg font-bold uppercase flex items-center gap-2"
          style={{ color: accent, textShadow: `0 0 6px ${accent}70` }}
        >
          <span className="text-xl">{icon}</span>
          {title}
        </h3>
        {sections && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-2 py-1 rounded border transition-all"
            style={{ borderColor: accent, color: accent }}
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {sections ? (
        <div className={`transition-all duration-300 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-32 opacity-70 overflow-hidden'}`}>
          {sections.map((section) => (
            <SubSection key={section.title} {...section} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-sm rounded border neon-btn transition-all duration-200 hover:scale-105"
              style={{ borderColor: `${accent}60`, color: '#e6edf3' }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const LabCatalog = () => {
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center"
          style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}
        >
          🧬 Laboratorios Científicos Avanzados
        </h1>
        <p className="text-base text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Recursos cuánticos, simulaciones matemáticas avanzadas y laboratorios virtuales para investigación científica de alto nivel.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Card key={c.title} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabCatalog;