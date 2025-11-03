import React from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  darkBackground: '#0a0a0a',
};

const Admin2FA = () => {
  return (
    <div className="p-8 pt-24 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-md mx-auto text-white card-float rounded-xl p-6" style={{ boxShadow: `0 0 12px ${NEON_COLORS.primary}50` }}>
        <h1 className="text-3xl font-bold mb-6 uppercase" style={{ color: NEON_COLORS.primary, textShadow: `0 0 10px ${NEON_COLORS.primary}80` }}>2FA Administrador</h1>
        <p className="text-sm text-gray-400 mb-4">Por seguridad, los administradores deben validar un código de doble factor.</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Código 2FA</label>
            <input type="text" className="w-full px-3 py-2 rounded-md bg-gray-900 border" style={{ borderColor: '#334155', color: '#e6edf3' }} />
          </div>
          <button type="button" className="w-full px-4 py-2 rounded-md neon-btn" style={{ backgroundColor: NEON_COLORS.secondary, color: '#0a0a0a', boxShadow: `0 0 8px ${NEON_COLORS.secondary}` }}>Validar</button>
        </form>
      </div>
    </div>
  );
};

export default Admin2FA;