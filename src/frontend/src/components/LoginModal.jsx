import React, { useState } from 'react';

// Si no existe AuthContext, usamos un mock simple para que no falle la compilación
// En producción, importaríamos: import { useAuth } from '../auth/AuthContext';

const LoginModal = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError(null);
    
    // Simular delay de red
    await new Promise(r => setTimeout(r, 800));
    
    if (username === 'admin' && password) {
        setLoading(false);
        if(onClose) onClose(true);
    } else {
        setLoading(false);
        setError('Credenciales inválidas (Prueba user: admin)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-8 rounded-xl border-2 relative" style={{ background:'#0a0a0a', borderColor:'#00FFFF', boxShadow:'0 0 25px #00FFFF40' }}>
        <button onClick={() => onClose && onClose(false)} className="absolute top-2 right-4 text-gray-500 hover:text-white text-xl">×</button>
        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold uppercase tracking-widest" style={{ color:'#00FFFF' }}>Acceso Seguro</h3>
            <p className="text-xs text-gray-400 mt-1">SIGC&T RURAL v2.0</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold mb-1 tracking-wider" style={{ color:'#39FF14' }}>Usuario</label>
            <input className="w-full p-3 rounded bg-gray-900 border text-white focus:outline-none focus:border-[#39FF14]" style={{ borderColor:'#334155' }} value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold mb-1 tracking-wider" style={{ color:'#39FF14' }}>Contraseña</label>
            <input type="password" className="w-full p-3 rounded bg-gray-900 border text-white focus:outline-none focus:border-[#39FF14]" style={{ borderColor:'#334155' }} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
          </div>
          
          {error && <div className="text-xs p-2 rounded bg-red-900/30 border border-red-500 text-red-200 text-center">{error}</div>}
          
          <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded font-bold uppercase tracking-widest transition-all hover:scale-[1.02]" style={{ backgroundColor: '#00FFFF', color: '#000', boxShadow: '0 0 15px #00FFFF60' }}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;