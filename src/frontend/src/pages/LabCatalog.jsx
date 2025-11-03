import React from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  darkBackground: '#0a0a0a',
};

const categories = [
  {
    title: 'Robótica',
    accent: '#00e5ff',
    links: [
      { label: 'ROS Wiki', href: 'http://wiki.ros.org/' },
      { label: 'Open Robotics', href: 'https://www.openrobotics.org/' },
      { label: 'Docs ROS2 (Humble)', href: 'https://docs.ros.org/en/humble/' },
    ],
  },
  {
    title: 'Sistemas Embebidos',
    accent: '#a3ff12',
    links: [
      { label: 'BeagleBoard.org', href: 'https://beagleboard.org/' },
      { label: 'BeagleBone Black', href: 'https://beagleboard.org/black' },
      { label: 'Zephyr RTOS', href: 'https://zephyrproject.org/' },
      { label: 'Yosys (FPGA Open Source)', href: 'https://yosyshq.net/yosys/' },
    ],
  },
  {
    title: 'Matemáticas',
    accent: '#ff3cc7',
    links: [
      { label: 'MIT OCW Matemáticas', href: 'https://ocw.mit.edu/courses/mathematics/' },
      { label: 'OpenStax (Matemáticas)', href: 'https://openstax.org/subjects/math' },
      { label: 'Wolfram MathWorld', href: 'https://mathworld.wolfram.com/' },
    ],
  },
  {
    title: 'Telecomunicaciones',
    accent: '#00e5ff',
    links: [
      { label: 'GNU Radio', href: 'https://www.gnuradio.org/' },
      { label: 'Start with GNU Radio', href: 'https://wiki.gnuradio.org/index.php/Start' },
      { label: 'ITU (Telecom/Standards)', href: 'https://www.itu.int/' },
    ],
  },
  {
    title: 'Agricultura + IA',
    accent: '#39FF14',
    links: [
      { label: 'FAO Digital Agriculture', href: 'https://www.fao.org/digital-agriculture' },
      { label: 'TensorFlow Lite', href: 'https://www.tensorflow.org/lite' },
      { label: 'OpenDroneMap', href: 'https://www.opendronemap.org/' },
    ],
  },
  {
    title: 'SENA y Universidades',
    accent: '#ff3cc7',
    links: [
      { label: 'SENA', href: 'https://www.sena.edu.co/' },
      { label: 'SOFIA Plus (SENA)', href: 'https://oferta.senasofiaplus.edu.co/sofia-oferta/' },
      { label: 'Universidad Nacional de Colombia', href: 'https://unal.edu.co/' },
      { label: 'Universidad de los Andes', href: 'https://uniandes.edu.co/' },
    ],
  },
];

const Card = ({ title, accent, links }) => (
  <div
    className="card-float rounded-xl p-6 transition-all duration-300"
    style={{ boxShadow: `0 0 12px ${accent}50`, borderColor: `${accent}66` }}
  >
    <h3
      className="text-xl font-bold mb-4 uppercase"
      style={{ color: accent, textShadow: `0 0 8px ${accent}80` }}
    >
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg border neon-btn"
          style={{ borderColor: accent, color: '#e6edf3' }}
        >
          {l.label}
        </a>
      ))}
    </div>
  </div>
);

const LabCatalog = () => {
  return (
    <div className="p-8 pt-24 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-10 uppercase text-center"
          style={{ color: NEON_COLORS.primary, textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA` }}
        >
          Catálogo de Laboratorios
        </h1>
        <p className="text-lg text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Laboratorios y recursos reales y virtuales, curados para cursos y áreas STEM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((c) => (
            <Card key={c.title} title={c.title} accent={c.accent} links={c.links} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabCatalog;