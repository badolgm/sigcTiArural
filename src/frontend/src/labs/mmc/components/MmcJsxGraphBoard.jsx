import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createBoard, destroyBoard, engineProvenance, loadEngine, MMC_PALETTE } from '../adapters/jsxgraphAdapter.js';

/**
 * Lee la paleta del tema desde las variables CSS en tiempo de ejecución.
 *
 * POR QUÉ NO HAY PALETA EN JS: los colores viven en `mmcWorkbench.css` como
 * `--mmc-cyan`, `--mmc-pink`, etc. Duplicarlos en un objeto de JS garantiza que
 * un día dejen de coincidir. JSXGraph escribe `stroke`/`fill` como atributos de
 * presentación SVG, donde `var()` no se resuelve, así que el valor hay que
 * conocerlo en JS de todos modos: se lee del CSS en lugar de reescribirlo.
 *
 * Los respaldos NO son hexadecimales escritos aquí: son `MMC_PALETTE`, la única
 * paleta en JS del MMC. Así hay un solo lugar con literales de color y el CSS
 * manda cuando está disponible. Los tableros montados fuera de
 * `.mmc-workbench` usan el respaldo y se ven igual.
 */
const THEME_VARS = {
  cyan: ['--mmc-cyan', MMC_PALETTE.curve],
  pink: ['--mmc-pink', MMC_PALETTE.curveAlt],
  green: ['--mmc-green', MMC_PALETTE.accent],
  amber: ['--mmc-amber', MMC_PALETTE.warn],
  axis: ['--mmc-faint', MMC_PALETTE.textDim],
  text: ['--mmc-text', MMC_PALETTE.text]
};

export const readMmcTheme = (element) => {
  const out = {};
  let style = null;
  try {
    style = element ? window.getComputedStyle(element) : null;
  } catch (err) {
    style = null;
  }
  for (const [key, [varName, fallback]] of Object.entries(THEME_VARS)) {
    const value = style?.getPropertyValue?.(varName)?.trim();
    out[key] = value || fallback;
  }
  return out;
};

/**
 * MmcJsxGraphBoard — puente React ↔ JSXGraph.
 *
 * POR QUÉ EXISTE: JSXGraph es imperativo y mantiene estado propio. Montarlo a
 * mano desde cada instrumento duplicaría en todas partes el mismo riesgo de
 * fuga. Este componente concentra el ciclo de vida en un solo sitio.
 *
 * CONTRATO DE VIDA:
 *
 *   · El tablero se crea UNA vez al montar y se destruye al desmontar.
 *   · Cambiar `boundingbox` NO recrea el tablero: las opciones se leen por ref.
 *   · `build` se invoca una vez, justo después de crear el tablero.
 *   · `rebuild` se invoca cuando cambia `rebuildKey`.
 *   · `build` y `rebuild` reciben `(board, ctx)` donde `ctx.theme` es la paleta
 *     leída del CSS y `ctx.JXG` es el espacio de nombres del motor.
 *
 * MODO ESTRICTO (R1): React 18 en StrictMode monta, desmonta y vuelve a montar
 * para detectar efectos impuros. Si el cleanup no libera el tablero, la segunda
 * monta se suma a la primera: dos tableros sobre el mismo host y un SVG
 * duplicado. `destroyBoard` es idempotente justamente para que el doble
 * ciclo de desarrollo no pueda romper el desmontaje.
 *
 * La bandera `cancelled` evita el fallo opuesto: que la promesa de carga resuelva
 * tarde, cuando el componente ya se desmontó, y cree un tablero en un nodo que
 * React ya no controla.
 */
const MmcJsxGraphBoard = ({
  build,
  rebuild,
  rebuildKey,
  boundingbox,
  height = 320,
  ariaLabel = 'Tablero matemático interactivo',
  className = '',
  onReady
}) => {
  const hostRef = useRef(null);
  const ctxRef = useRef(null);
  const boardRef = useRef(null);
  const buildRef = useRef(build);
  const rebuildRef = useRef(rebuild);
  const onReadyRef = useRef(onReady);
  const [boardReady, setBoardReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs actualizadas en cada render: el efecto de montaje lee el valor vigente
  // sin necesitarlo como dependencia. Es lo que permite que el ciclo de vida
  // del tablero sea de montaje simple sin suprimir reglas de hooks.
  const optionsRef = useRef(null);
  optionsRef.current = { boundingbox, height };

  buildRef.current = build;
  rebuildRef.current = rebuild;
  onReadyRef.current = onReady;

  // Ciclo de vida del tablero: montaje simple, a propósito.
  useEffect(() => {
    let cancelled = false;

    loadEngine()
      .then((JXG) => {
        if (cancelled || !hostRef.current) return;

        const { boundingbox: bbox, height: h } = optionsRef.current;
        // El host necesita dimensiones explícitas antes de initBoard: JSXGraph
        // las lee del elemento para calcular unidades y origen.
        if (hostRef.current.clientHeight === 0) {
          hostRef.current.style.height = `${h}px`;
        }

        const board = createBoard(hostRef.current, {
          boundingbox: Array.isArray(bbox) ? bbox : [-5, 5, 5, -5]
        });
        boardRef.current = board;

        // Contexto que comparten `build` y `rebuild`. La paleta se lee una vez
        // por tablero: leerla en cada rebuild sería trabajo repetido sin gain.
        const ctx = { JXG, theme: readMmcTheme(hostRef.current) };

        ctxRef.current = ctx;
        if (typeof buildRef.current === 'function') {
          buildRef.current(board, ctx);
        }
        board.update();
        setBoardReady(true);
        setError(null);
        onReadyRef.current?.({ board, ...engineProvenance() });
      })
      .catch((err) => {
        if (cancelled) return;
        // Estado honesto: si el motor no carga, se dice ROTO. Nunca un div vacío.
        setError(err?.message || String(err));
        onReadyRef.current?.({ board: null, estado: 'ROTO', error: String(err) });
      });

    return () => {
      cancelled = true;
      const board = boardRef.current;
      boardRef.current = null;
      setBoardReady(false);
      destroyBoard(board);
    };
  }, []);

  // Los tableros de JSXGraph no releen sus dimensiones solos. `board.resize()`
  // no existe en 1.13.3: la API real es `resizeContainer`. Es una mejora
  // best-effort: si falla, el tablero sigue siendo correcto, solo se deforma
  // hasta el siguiente rebuild.
  useEffect(() => {
    if (!boardReady) return undefined;
    const onResize = () => {
      const board = boardRef.current;
      const host = hostRef.current;
      if (!board || !host) return;
      try {
        if (typeof board.resizeContainer === 'function') {
          board.resizeContainer(host.clientWidth, host.clientHeight);
        }
      } catch (err) {
        console.warn('[MMC/jsxgraph] resizeContainer falló:', err);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [boardReady]);

  // Redibujado por cambio de estado de React (sliders, entradas, modelo).
  useEffect(() => {
    if (!boardReady) return;
    const board = boardRef.current;
    if (!board) return;
    try {
      if (typeof rebuildRef.current === 'function') rebuildRef.current(board, ctxRef.current);
      board.update();
    } catch (err) {
      console.error('[MMC/jsxgraph] rebuild falló:', err);
    }
    // `rebuildKey` es deliberadamente la dependencia: es el contrato que declara
    // el consumidor para indicar "el modelo cambió, vuelve a dibujar".
  }, [boardReady, rebuildKey]);

  const handleHostRef = useCallback((node) => {
    hostRef.current = node;
  }, []);

  if (error) {
    return (
      <div
        className={`mmc-board-fail ${className}`}
        style={{ height, borderColor: 'rgba(255,107,107,.5)' }}
        role="alert"
      >
        <strong>ROTO</strong>
        <span>El motor visual no pudo iniciar: {error}</span>
      </div>
    );
  }

  return (
    <div className={`mmc-board ${className}`} style={{ height }}>
      <div
        ref={handleHostRef}
        className="mmc-board-host"
        style={{ width: '100%', height: '100%' }}
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default MmcJsxGraphBoard;