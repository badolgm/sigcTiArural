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
    sections: [
      {
        title: 'Plataforma ROS',
        accent: '#00bcd4',
        links: [
          { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-robotics', internal: true },
          { label: 'ROS Wiki', href: 'http://wiki.ros.org/' },
          { label: 'Docs ROS2 (Humble)', href: 'https://docs.ros.org/en/humble/' },
          { label: 'ROSBridge Suite', href: 'https://wiki.ros.org/rosbridge_suite' },
        ],
      },
      {
        title: 'Simulación y Mundos',
        accent: '#00e5ff',
        links: [
          { label: 'Gazebo Simulator', href: 'https://gazebosim.org/' },
          { label: 'Gazebo Fuel Worlds', href: 'https://fuel.gazebosim.org/' },
          { label: 'Webots Player (Cloud)', href: 'https://play.webots.cloud/' },
        ],
      },
      {
        title: 'Manipulación y Visualización',
        accent: '#26c6da',
        links: [
          { label: 'MoveIt (Manipulación)', href: 'https://moveit.picknik.ai/' },
        ],
      },
      
    ],
  },
  {
    title: 'Sistemas Embebidos',
    accent: '#a3ff12',
    icon: '⚡',
    sections: [
      {
        title: 'Hardware y Placas',
        accent: '#9fff2f',
        links: [
          { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-embedded', internal: true },
          { label: 'BeagleBoard.org', href: 'https://beagleboard.org/' },
          { label: 'BeagleBone Black', href: 'https://beagleboard.org/black' },
          { label: 'Arduino IDE', href: 'https://www.arduino.cc/en/software' },
          { label: 'Raspberry Pi Docs', href: 'https://www.raspberrypi.com/documentation/' },
        ],
      },
      {
        title: 'RTOS y FPGA',
        accent: '#86ef2f',
        links: [
          { label: 'Zephyr RTOS', href: 'https://zephyrproject.org/' },
          { label: 'Renode (Emulación HW)', href: 'https://renode.io/' },
          { label: 'FreeRTOS', href: 'https://www.freertos.org/' },
          { label: 'ESP-IDF (Espressif)', href: 'https://docs.espressif.com/projects/esp-idf/en/latest/' },
        ],
      },
      {
        title: 'Herramientas y ML en Micro',
        accent: '#a8ff3d',
        links: [
          { label: 'PlatformIO', href: 'https://platformio.org/' },
          { label: 'TensorFlow Lite Micro', href: 'https://www.tensorflow.org/lite/microcontrollers' },
          { label: 'EDGE_SETUP (SIGC&T)', href: 'https://github.com/badolgm/sigcTiArural/blob/main/docs/EDGE_SETUP.md' },
        ],
      },
    ],
  },
  {
    title: 'Matemáticas Avanzadas',
    accent: '#ff3cc7',
    icon: '∫',
    isExpanded: false,
    sections: [
      {
        title: 'Laboratorio Cuántico - Nivel Fácil',
        accent: '#ff6b9d',
        links: [
          { label: '🧮 Lab Matemáticas Interactivo', to: 'advanced-math', internal: true },
          { label: '🧮 Dr. Binary (V2)', to: 'advanced-math-v2', internal: true },
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
          { label: 'UVic DiffyQs (Separable)', href: 'https://web.uvic.ca/~tbazett/diffyqs/separable_section.html' },
          { label: 'EVA UdelaR (Página DE)', href: 'https://eva.fcien.udelar.edu.uy/mod/page/view.php?id=103628' },
          { label: 'Ecuaciones Diferenciales (Weebly)', href: 'https://ecdiferenciales.weebly.com/' },
          { label: 'UniOviedo Docencia', href: 'https://www.unioviedo.es/bayon/docen/' },
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
          { label: 'Variable Compleja (IMA UMN)', href: 'https://www.ima.umn.edu/~arnold/complex.html' },
          { label: 'Laboratorio Señales UNR FCEIA', href: 'https://www.fceia.unr.edu.ar/lsd/' },
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
          { label: 'Álgebra Superior I (UNAM)', href: 'https://www.matem.unam.mx/~max/algebrasuperior1.html' },
          { label: 'Álgebra Superior II (UNAM)', href: 'https://www.matem.unam.mx/~max/algebrasuperior2.html' },
          { label: 'Geometría Avanzada (UNAM)', href: 'https://www.matem.unam.mx/~max/geometriaavanzada.html' },
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
          { label: 'Curso de Geometría (UNAM)', href: 'https://www.matem.unam.mx/~rgomez/geometria/' },
          { label: 'Geometría (UNAM - HTML)', href: 'https://www.matem.unam.mx/~rgomez/geometria/geometria.html' },
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
          { label: 'Procesamiento de Señales (sp4comm)', href: 'https://www.sp4comm.org/webversion.html' },
          { label: 'Hamiltonianos y Física Clásica', href: 'http://casanchi.org/fis/hamilto01.htm' },
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
          { label: 'Grupos (UNAM DCB)', href: 'http://profesores.dcb.unam.mx/users/franciscompr/grupos.html' },
          { label: 'Galois (EVA UdelaR)', href: 'https://eva.fcien.udelar.edu.uy/course/view.php?id=564' },
          { label: 'UTN – Ecuaciones Aplicadas', href: 'http://www.utn-eaplicada.com.ar/' },
        ],
      },

      
    ],
  },

  // Nueva categoría separada para Física y Electrónica
  {
    title: 'Física y Electrónica',
    accent: '#ff4d4d',
    icon: '⚛️',
    sections: [
      {
        title: 'Física Cuántica y Clásica',
        accent: '#ff6b6b',
        links: [
          { label: 'Mecánica Cuántica (UdeA – ClusterCien)', href: 'https://clustercien.udea.edu.co/web/tiki-index.php?page=Mec%C3%A1nica+Cu%C3%A1ntica' },
          { label: 'ClusterCien – Inicio', href: 'https://clustercien.udea.edu.co/web/tiki-index.php?page=P%C3%A1gina+de+Inicio' },
          { label: 'PUC – FIM8530 (Clases)', href: 'http://www.fis.puc.cl/~jalfaro/Fim8530/clases/' },
          { label: 'PUC – Jaime Alfaro', href: 'http://www.fis.puc.cl/~jalfaro/' },
        ],
      },
      {
        title: 'Dinámica Orbital',
        accent: '#ff4d4d',
        links: [
          { label: 'Astronomía (Uy) – Dinámica', href: 'http://www.astronomia.edu.uy/depto/mece/' },
        ],
      },
      {
        title: 'Materia e Interacción (VPython)',
        accent: '#39ff14',
        links: [
          { label: 'Matter & Interactions', href: 'https://matterandinteractions.org/' },
          { label: 'Ruth Chabay', href: 'https://ruthchabay.net/' },
          { label: 'GlowScript (VPython)', href: 'https://glowscript.org/' },
          { label: 'Trinket VPython', href: 'https://matter-interactions.trinket.io/00_welcome_to_vpython#/welcome-to-vpython/getting-started' },
          { label: 'UNSL – Bibliografía Física', href: 'http://www0.unsl.edu.ar/~cornette/FISICA/bibliografia.html' },
        ],
      },
      {
        title: 'Electrónica y Circuitos',
        accent: '#00e5ff',
        links: [
          { label: '🧪 Abrir Laboratorio (SIGC&T)', to: 'lab-electronics', internal: true },
          { label: 'Falstad Circuit Simulator', href: 'https://falstad.com/circuit/' },
          { label: 'LTspice', href: 'https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html' },
          { label: 'CircuitLab', href: 'https://www.circuitlab.com/' },
          { label: 'All About Circuits', href: 'https://www.allaboutcircuits.com/' },
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
    title: 'Cursos',
    accent: '#39FF14',
    icon: '🎓',
    links: [
      { label: 'SENA – SOFIA Plus', href: 'https://oferta.senasofiaplus.edu.co/sofia-oferta/' },
      { label: 'SENA – Portal', href: 'https://www.sena.edu.co/' },
      { label: 'OpenFING (Cursos)', href: 'https://open.fing.edu.uy/' },
      { label: 'OCW Univ. Cantabria', href: 'https://ocw.unican.es/course/index.php?categoryid=3' },
      { label: 'MIT OpenCourseWare', href: 'https://ocw.mit.edu/' },
      { label: 'U-Cursos Ingeniería (CL)', href: 'https://www.u-cursos.cl/ingenieria/2/cursos_departamento/indice' },
      { label: 'UNAM – Sistemas (erhc)', href: 'https://sistemas.fciencias.unam.mx/~erhc/' },
      { label: 'UTFSM – Comp. Científica', href: 'https://www.inf.utfsm.cl/~parce/cc2/index.html' },
      { label: 'USACH – Mecánica (materiales)', href: 'https://mecanica-usach.mine.nu/media/uploads/' },
      { label: 'Luca Martino (Bayes)', href: 'http://www.lucamartino.altervista.org/' },
      { label: 'Mathstools – Sumación Einstein', href: 'https://www.mathstools.com/section/main/sumacion_einstein?lang=es' },
    ],
  },
  {
    title: 'SENA y Universidades / OCW',
    accent: '#ff6b9d',
    icon: '🎓',
    sections: [
      {
        title: 'SENA / SIGC&T',
        accent: '#ff6b9d',
        links: [
          { label: 'SENA', href: 'https://www.sena.edu.co/' },
          { label: 'SOFIA Plus', href: 'https://oferta.senasofiaplus.edu.co/sofia-oferta/' },
          { label: '📚 Ver MASTERDOC v4.2 (Interno)', to: 'docs-masterdoc', internal: true },
        ],
      },
      {
        title: 'OCW / Universidades (LATAM/ES)',
        accent: '#e84393',
        links: [
          { label: 'Open FING (Uruguay)', href: 'https://open.fing.edu.uy/' },
          { label: 'FCEIA UNR – Apuntes', href: 'https://www.fceia.unr.edu.ar/tesys/html/apuntes.html' },
          { label: 'OCW Univ. Cantabria', href: 'https://ocw.unican.es/course/index.php?categoryid=3' },
          { label: 'EasyFING', href: 'https://easyfing.com/' },
          { label: 'UAbierta – Univ. de Chile', href: 'https://www.uabierta.uchile.cl/' },
          { label: 'edX – Uniandes (Colombia)', href: 'https://www.edx.org/school/andesx' },
          { label: 'edX – PUC Chile', href: 'https://www.edx.org/school/pucchilex' },
          { label: 'edX – ITBA (Argentina)', href: 'https://www.edx.org/school/itbax' },
        ],
      },
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
      { label: 'Backend Health (Render)', href: 'https://sigct-backend.onrender.com/health' },
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