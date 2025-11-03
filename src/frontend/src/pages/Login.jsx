import React from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  darkBackground: '#0a0a0a',
};

const Login = () => {
  return (
    <div className="p-8 pt-24 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-md mx-auto text-white card-float rounded-xl p-6" style={{ boxShadow: `0 0 12px ${NEON_COLORS.primary}50` }}>
        <h1 className="text-3xl font-bold mb-6 uppercase" style={{ color: NEON_COLORS.primary, textShadow: `0 0 10px ${NEON_COLORS.primary}80` }}>Acceder</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Correo</label>
            <input type="email" className="w-full px-3 py-2 rounded-md bg-gray-900 border" style={{ borderColor: '#334155', color: '#e6edf3' }} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">Contraseña</label>
            <input type="password" className="w-full px-3 py-2 rounded-md bg-gray-900 border" style={{ borderColor: '#334155', color: '#e6edf3' }} />
          </div>
          <button type="button" className="w-full px-4 py-2 rounded-md neon-btn" style={{ backgroundColor: NEON_COLORS.secondary, color: '#0a0a0a', boxShadow: `0 0 8px ${NEON_COLORS.secondary}` }}>Entrar</button>
        </form>
        <p className="mt-4 text-sm text-gray-500">¿No tienes cuenta? Regístrate.</p>
      </div>
    </div>
  );
};

export default Login;