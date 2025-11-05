import React from 'react';
import { useAuth } from '../auth/AuthContext';

const AuthGuard = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return children;
  return fallback || (
    <div className="p-6 rounded-xl border-2 text-sm" style={{ background:'#0a0a0a', borderColor:'#FF3131', color:'#e6edf3' }}>
      <div className="font-bold mb-2" style={{ color:'#FF3131' }}>Acción restringida</div>
      <p>Debes iniciar sesión para acceder a esta sección o realizar cambios.</p>
    </div>
  );
};

export default AuthGuard;