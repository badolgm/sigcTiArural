import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// El repo tiene @react-three/fiber 9 / drei 10, que exigen React >=19 <19.3,
// mientras el frontend corre React 18.3.1. Importarlos desde esta ruta hace
// que `react-reconciler` reviente al evaluar el módulo (pantalla blanca) ANTES
// de que React monte nada. Por eso la proyección usa `three` de forma
// imperativa: es el mismo motor 3D ya versionado, sin puente de reconciliador
// y sin instalar paquetes nuevos. Si WebGL no está disponible, se informa ROTO
// y la fuente sigue accesible en S35 / JSON 2D.

// Proyección 3D del laboratorio matemático.
//
// HONESTIDAD: este componente NUNCA decide el estado. Lo recibe de la fuente:
//   · señal publicada por MmcMathematicsCore → S35.estado (SIM / REAL-LOCAL)
//   · trazos dibujados en el navegador     → SIM (generado localmente)
// Si no hay datos, muestra NO_DATA: no fabrica una curva de adorno ni eleva
// una simulación a REAL. Las coordenadas 3D son una proyección VISUAL; los
// valores originales siguen viviendo en la serie del store y en el JSON 2D.

/**
 * Serie temporal → hélice. Ángulo en XZ = tiempo normalizado, altura Y = valor
 * normalizado. Es una proyección, no una trayectoria física: se declara así en
 * el HUD. Toma los snapshots acotados (máx. 64 muestras) del store S35.
 */
export const projectSeriesToPaths = (samples) => {
  if (!Array.isArray(samples)) return [];
  const vals = samples
    .filter((s) => Array.isArray(s) && Number.isFinite(s[0]) && Number.isFinite(s[1]))
    .map((s) => [s[0], s[1]]);
  if (vals.length < 2) return [];

  let vMin = Infinity;
  let vMax = -Infinity;
  vals.forEach(([, v]) => {
    if (v < vMin) vMin = v;
    if (v > vMax) vMax = v;
  });
  const span = vMax - vMin || 1;
  const t0 = vals[0][0];
  const tSpan = (vals[vals.length - 1][0] - t0) || 1;

  const points = vals.map(([t, v]) => {
    const u = (t - t0) / tSpan;
    const angle = u * Math.PI * 4; // dos vueltas completas sobre el dominio
    const radius = 1.8 + 0.5 * ((v - vMin) / span);
    const y = ((v - vMin) / span - 0.5) * 3;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  });
  return [{ id: 'serie-S35', points }];
};

/**
 * Espacio de fase (x, x′, x″) publicado por S35 → trayectoria 3D.
 *
 * Cada eje es UNA componente calculada por `realSeriesCalculus`: no es una
 * hélice decorativa ni una forma de onda inventada. Se normaliza al cubo visual
 * [-3,3] SOLO para comparar magnitudes dispares; el HUD muestra la procedencia
 * heredada y el rango original sigue vivo en S35. Si faltan derivadas se
 * devuelve [] y la vista dice NO_DATA.
 */
export const projectPhaseSpaceToPaths = (phaseSamples) => {
  if (!Array.isArray(phaseSamples)) return [];
  const triples = phaseSamples
    .filter((p) => Array.isArray(p) && p.length >= 3 && p.every(Number.isFinite))
    .map((p) => [p[0], p[1], p[2]]);
  if (triples.length < 2) return [];

  const scale = (index) => {
    let lo = Infinity;
    let hi = -Infinity;
    triples.forEach((p) => {
      if (p[index] < lo) lo = p[index];
      if (p[index] > hi) hi = p[index];
    });
    const span = hi - lo || 1;
    return (v) => ((v - lo) / span - 0.5) * 5;
  };
  const sx = scale(0);
  const sd1 = scale(1);
  const sd2 = scale(2);

  return [{
    id: 'fase-S35',
    points: triples.map((p) => [sx(p[0]), sd1(p[1]), sd2(p[2])])
  }];
};

/**
 * Trazos 2D → capas apiladas en Z. Cada trazo conserva su identidad y sus
 * puntos; se normalizan al cubo visual [-3,3] SOLO para que capas con dominios
 * distintos sean comparables. El JSON exportado en 2D mantiene los valores
 * originales: esta normalización no sustituye a la fuente de datos.
 */
export const projectStrokesToPaths = (strokes, { gap = 0.7 } = {}) => {
  if (!Array.isArray(strokes)) return [];
  // Se conserva el trazo original junto a sus puntos: si alguno se descarta por
  // tener menos de 2 puntos válidos, el índice de `all` ya no coincide con el
  // de `strokes` y el id exportado dejaría de identificar el trazo real.
  const all = strokes
    .map((s) => ({
      stroke: s,
      points: (Array.isArray(s?.points) ? s.points : [])
        .filter((p) => Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite))
    }))
    .filter((entry) => entry.points.length >= 2);
  if (!all.length) return [];

  let xMin = Infinity; let xMax = -Infinity;
  let yMin = Infinity; let yMax = -Infinity;
  all.forEach(({ points }) => points.forEach(([x, y]) => {
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }));
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const scale = (v, lo, span) => ((v - lo) / span - 0.5) * 5;

  return all.map(({ stroke, points }, i) => ({
    id: `trazo-${stroke?.id ?? i}`,
    points: points.map(([x, y]) => [scale(x, xMin, xSpan), scale(y, yMin, ySpan), (i - (all.length - 1) / 2) * gap])
  }));
};

const STATE_COLOR = {
  'REAL-LOCAL': '#39ff14',
  LOCAL: '#fbbf24',
  SIM: '#00ffff',
  ROTO: '#ff3131',
  NO_DATA: '#94a3b8'
};

/**
 * Escena imperativa en three. Devuelve una función de limpieza que libera
 * geometrías, materiales, controles, renderer y el contexto WebGL: el toggle
 * de la proyección puede encenderse y apagarse muchas veces sin fugas. Si el
 * montaje falla a mitad de camino, se limpia lo ya creado antes de propagar el
 * error para que el componente pueda mostrar ROTO sin dejar un canvas huérfano.
 */
const mountScene = (container, { paths, color, showNodes }) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(8, 6, 8);
  camera.lookAt(0, 0, 0);

  let renderer = null;
  let controls = null;
  let observer = null;
  let frame = 0;
  let resize = () => {};

  const disposeAll = () => {
    cancelAnimationFrame(frame);
    if (observer) observer.disconnect();
    else window.removeEventListener('resize', resize);
    if (controls) controls.dispose();
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : (object.material ? [object.material] : []);
      materials.forEach((material) => material.dispose());
    });
    if (renderer) {
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    }
  };

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x05070d, 1);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(6, 8, 6);
    scene.add(pointLight);
    const grid = new THREE.GridHelper(12, 12, 0x1e293b, 0x0f172a);
    grid.position.y = -3;
    scene.add(grid);
    scene.add(new THREE.AxesHelper(3));

    const lineMaterial = new THREE.LineBasicMaterial({ color });
    const nodeGeometry = new THREE.SphereGeometry(0.07, 10, 10);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color });
    const nodeStep = paths.length
      ? Math.max(1, Math.floor(Math.max(...paths.map((p) => p.points.length)) / 14))
      : 1;

    paths.forEach((path) => {
      const group = new THREE.Group();
      const geometry = new THREE.BufferGeometry().setFromPoints(
        path.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
      );
      group.add(new THREE.Line(geometry, lineMaterial));
      if (showNodes) {
        path.points
          .filter((_, i) => i % nodeStep === 0 || i === path.points.length - 1)
          .forEach((p) => {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(p[0], p[1], p[2]);
            group.add(node);
          });
      }
      scene.add(group);
    });

    resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };
    resize();
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize);
      observer.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return disposeAll;
  } catch (error) {
    disposeAll();
    throw error;
  }
};

const MmcSignal3DProjection = ({
  title = 'Proyección 3D · MMC',
  estado = 'NO_DATA',
  sourceLabel = 'sin fuente',
  rangeLabel = '',
  paths = [],
  color,
  note = '',
  height = 360
}) => {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const pointCount = useMemo(
    () => paths.reduce((acc, p) => acc + (p.points?.length ?? 0), 0),
    [paths]
  );
  const resolvedColor = color || STATE_COLOR[estado] || '#94a3b8';
  const hasData = paths.length > 0 && pointCount >= 2;

  useEffect(() => {
    if (!hasData || !mountRef.current) return undefined;
    let cleanup;
    try {
      cleanup = mountScene(mountRef.current, { paths, color: resolvedColor, showNodes: true });
      setFailed(false);
    } catch (error) {
      setFailed(true);
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [hasData, paths, resolvedColor]);

  const message = failed
    ? 'ROTO · WebGL no pudo montar la proyección en este navegador. La fuente sigue disponible en S35 y en el JSON 2D; no se fabrica una proyección.'
    : 'NO_DATA · sin puntos para proyectar. Cargá una serie en el núcleo MMC o dibujá un trazo.';

  return (
    <div className="mmc-3d-projection" style={{ margin: '10px 0' }}>
      <div style={{
        position: 'relative', width: '100%', height, background: '#05070d',
        borderRadius: 10, overflow: 'hidden', border: '1px solid #16202e'
      }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        {(!hasData || failed) && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: failed ? '#ff3131' : '#94a3b8', fontFamily: 'ui-monospace,Menlo,monospace',
            fontSize: 12, textAlign: 'center', padding: 16
          }}>
            {message}
          </div>
        )}

        <div style={{
          position: 'absolute', top: 10, left: 10, maxWidth: '78%',
          color: '#e2e8f0', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
          background: 'rgba(0,0,0,0.78)', padding: '8px 10px', borderRadius: 4,
          pointerEvents: 'none', zIndex: 10
        }}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #1e293b', marginBottom: 4 }}>
            {title}
          </div>
          <div>ESTADO: <b style={{ color: failed ? STATE_COLOR.ROTO : resolvedColor }}>{failed ? 'ROTO' : estado}</b></div>
          <div>FUENTE: {sourceLabel}</div>
          {rangeLabel && <div>RANGO: {rangeLabel}</div>}
          <div>{paths.length} trayectoria(s) · {pointCount} puntos proyectados</div>
        </div>
      </div>
      <p className="board-note" style={{ margin: '4px 0 0' }}>
        {note || 'Proyección generada en el navegador con el motor 3D existente. Sin escritura en disco ni envío a servicios.'}
        {' '}El estado se hereda de la fuente: nunca se eleva SIM a REAL.
      </p>
    </div>
  );
};

export default MmcSignal3DProjection;
