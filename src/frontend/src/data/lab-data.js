export const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  quantum: '#ff3cc7',
  darkBackground: '#0a0a0a',
};

export const labCategories = [
  {
    title: 'Robótica',
    accent: '#00e5ff',
    icon: '🤖',
    links: [
      { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-robotics', internal: true },
      { label: 'ROS Wiki', href: 'http://wiki.ros.org/' },
      { label: 'Open Robotics', href: 'https://www.openrobotics.org/' },
      { label: 'Docs ROS2 (Humble)', href: 'https://docs.ros.org/en/humble/' },
      { label: 'Gazebo Simulator', href: 'https://gazebosim.org/' },
      { label: 'Webots Player (Cloud)', href: 'https://play.webots.cloud/' },
      { label: 'URDF Viewer (Three.js)', href: 'https://gkjohnson.github.io/urdf-loaders/examples/urdf-viewer.html' },
      { label: 'MoveIt (Manipulación)', href: 'https://moveit.picknik.ai/' },
      { label: 'TurtleBot3 Tutorials', href: 'https://emanual.robotis.com/docs/en/platform/turtlebot3/overview/' },
      { label: 'ROSBridge Suite', href: 'https://wiki.ros.org/rosbridge_suite' },
      { label: 'Gazebo Fuel Worlds', href: 'https://fuel.gazebosim.org/' },
      { label: 'Ignition (Fortress/Garden)', href: 'https://gazebosim.org/docs' },
    ],
  },
  {
    title: 'Sistemas Embebidos',
    accent: '#a3ff12',
    icon: '⚡',
    links: [
      { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-embedded', internal: true },
      { label: 'BeagleBoard.org', href: 'https://beagleboard.org/' },
      { label: 'BeagleBone Black', href: 'https://beagleboard.org/black' },
      { label: 'Zephyr RTOS', href: 'https://zephyrproject.org/' },
      { label: 'Yosys (FPGA)', href: 'https://yosyshq.net/yosys/' },
      { label: 'Arduino IDE', href: 'https://www.arduino.cc/en/software' },
      { label: 'Wokwi Simulator', href: 'https://wokwi.com/' },
      { label: 'Renode (Emulación HW)', href: 'https://renode.io/' },
      { label: 'TensorFlow Lite Micro', href: 'https://www.tensorflow.org/lite/microcontrollers' },
      { label: 'PlatformIO', href: 'https://platformio.org/' },
      { label: 'EDGE_SETUP (SIGC&T)', href: 'https://github.com/badolgm/sigcTiArural/blob/main/docs/EDGE_SETUP.md' },
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
          { label: '🧮 Lab Matemáticas Interactivo', to: 'advanced-math', internal: true },
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
      { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-telecom', internal: true },
      { label: 'GNU Radio', href: 'https://www.gnuradio.org/' },
      { label: 'Start with GNU Radio', href: 'https://wiki.gnuradio.org/index.php/Start' },
      { label: 'ITU Standards', href: 'https://www.itu.int/' },
      { label: 'SDR Academy', href: 'https://www.sdrplay.com/sdr-academy/' },
      { label: 'WebSDR Index', href: 'https://www.websdr.org/' },
      { label: 'SDR# (Airspy)', href: 'https://airspy.com/download/' },
      { label: 'SatNOGS Network', href: 'https://network.satnogs.org/' },
      { label: 'SDRangel', href: 'https://github.com/f4exb/sdrangel' },
      { label: 'RTL-SDR Blog', href: 'https://www.rtl-sdr.com/' },
    ],
  },
  {
    title: 'Agricultura + IA',
    accent: '#39FF14',
    icon: '🌱',
    links: [
      { label: '🧪 Abrir Diagnóstico IA (SIGC&T)', to: 'ai', internal: true },
      { label: 'FAO Digital Agriculture', href: 'https://www.fao.org/digital-agriculture' },
      { label: 'TensorFlow Lite', href: 'https://www.tensorflow.org/lite' },
      { label: 'OpenDroneMap', href: 'https://www.opendronemap.org/' },
      { label: 'PlantNet', href: 'https://plantnet.org/' },
    ],
  },
  {
    title: 'Ciencia de Datos',
    accent: '#ffd32a',
    icon: '📊',
    links: [
      { label: '🧪 Abrir Laboratorio de Datos (SIGC&T)', to: 'data-lab', internal: true },
      { label: 'Pyodide (Python en Web)', href: 'https://pyodide.org/en/stable/' },
      { label: 'Plotly.js', href: 'https://plotly.com/javascript/' },
      { label: 'GitHub Open Data', href: 'https://github.com/search?q=dataset&type=Repositories' },
      { label: 'PlantVillage Dataset', href: 'https://github.com/spMohanty/PlantVillage-Dataset' },
      { label: 'Kaggle Datasets', href: 'https://www.kaggle.com/datasets' },
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
      { label: '📚 Ver MASTERDOC v4.2 (Interno)', to: 'docs-masterdoc', internal: true },
    ],
  },
  {
    title: 'Documentación Técnica',
    accent: '#00e5ff',
    icon: '📑',
    links: [
      { label: 'README del Proyecto', to: 'docs-readme', internal: true },
      { label: 'MASTERDOC v4.2 (DAS)', to: 'docs-masterdoc', internal: true },
      { label: 'Plan Maestro v4.2', to: 'docs-plan', internal: true },
      { label: 'API Reference', to: 'docs-api', internal: true },
      { label: 'Guía EDGE_SETUP', to: 'docs-edge-setup', internal: true },
      { label: 'Backend Health (Render)', href: 'https://sigct-backend.onrender.com/api/health/' },
      { label: 'Swagger UI (Cloud)', href: 'https://api.sigct-rural.com/api/docs/' },
      { label: 'ReDoc (Cloud)', href: 'https://api.sigct-rural.com/api/redoc/' },
    ],
  },
  {
    title: 'Web3 & Blockchain',
    accent: '#39FF14',
    icon: '⛓️',
    links: [
      { label: 'IPFS (Docs)', href: 'https://docs.ipfs.tech/' },
      { label: 'Kubo (go-ipfs)', href: 'https://github.com/ipfs/kubo' },
      { label: 'Filecoin (Docs)', href: 'https://docs.filecoin.io/' },
      { label: 'Ethereum Dev (Docs)', href: 'https://ethereum.org/en/developers/docs/' },
      { label: 'Hyperledger Fabric (Docs)', href: 'https://hyperledger-fabric.readthedocs.io/' },
      { label: 'Cosmos SDK / Tendermint', href: 'https://docs.cosmos.network/' },
      { label: 'IPFS Desktop', href: 'https://github.com/ipfs/ipfs-desktop' },
    ],
  },
];



























































































































































// end