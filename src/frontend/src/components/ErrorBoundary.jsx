import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded bg-red-900/20 text-red-200">
          <h3 className="font-bold text-lg mb-2">⚠️ Error en el Componente</h3>
          <p className="text-sm mb-4">Algo salió mal al cargar esta sección. No te preocupes, el resto de la aplicación sigue funcionando.</p>
          <details className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
            <summary className="cursor-pointer mb-1 text-red-400">Ver detalles técnicos</summary>
            {this.state.error && this.state.error.toString()}
          </details>
          <div className="flex gap-2 mt-4">
            <button 
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
              onClick={() => this.setState({ hasError: false })}
            >
              Intentar Recargar
            </button>
            {this.props.onReset && (
              <button 
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-xs transition-colors"
                onClick={this.props.onReset}
              >
                Restablecer Datos (Reset Factory)
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
