import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    const res = await login(username, password);
    setLoading(false);
    if (res && res.ok) onClose && onClose(true);
    else setError('Inicio de sesión fallido');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-sm p-6 rounded-xl border-2" style={{ background:'#0a0a0a', borderColor:'#00FFFF', boxShadow:'0 0 15px #00FFFF80' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color:'#00FFFF' }}>🔐 Autenticación requerida</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color:'#39FF14' }}>Usuario</label>
            <input className="w-full p-2 rounded border bg-transparent text-white" style={{ borderColor:'#00FFFF60' }} value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color:'#39FF14' }}>Contraseña</label>
            <input type="password" className="w-full p-2 rounded border bg-transparent text-white" style={{ borderColor:'#00FFFF60' }} value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          {error && <div className="text-sm" style={{ color:'#FF3131' }}>{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-2 rounded border" style={{ borderColor:'#334155', color:'#e6edf3' }} onClick={()=>onClose && onClose(false)}>Cancelar</button>
            <button type="submit" disabled={loading} className="px-3 py-2 rounded border" style={{ borderColor:'#00FFFF', color:'#00FFFF' }}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;