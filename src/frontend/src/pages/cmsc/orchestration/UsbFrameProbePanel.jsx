// SONDA DE TRANSPORTE CON AUTORIZACIÓN EXPLÍCITA EN PANTALLA (Etapa 1b). Alcance:
// - la cámara permanece apagada hasta que el usuario pulsa «Activar cámara»;
// - la vista previa en vivo NO captura NI envía nada por sí sola;
// - hace falta marcar una casilla explícita y pulsar «Autorizar capturar y ENVIAR frame ahora»
//   o «Autorizar y grabar clip»; el clip vive SOLO en memoria (MediaRecorder + Blob);
// - el origen de la prueba se declara en pantalla (por defecto terraza real con plantas);
// - NO escribe en data/, NO etiqueta, NO anota y NO cambia el modelo servido
//   (M1 baseline oficial congelado / M2 challenger validado: servir != promover).
import { useCallback, useEffect, useRef, useState } from 'react';
import { AI_INFERENCE_URL, buildInfoFromOfficialResponse } from '../../AIPredictiva.jsx';
import { NEON } from '../honesty.js';

const FRAME_FILE_RE = /^image_\d{8}_\d{6}_\d{3}(?:\.jpe?g)?$/i;
const VIDEO_ID_RE = /^video_\d{8}_\d{6}_\d{3}(?:\.mp4)?$/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
const CLIENT_CONTEXT = 'usb_frame_contract_v1';

const TEST_ORIGINS = [
  'Prueba real en terraza · plantas domésticas en vivo',
  'Prueba real en campo abierto · cultivo no curado (fuera de dominio del dataset)',
  'Prueba controlada de escritorio · escena general (no agrícola)',
];

const CLIP_MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

const pad = (value, length = 2) => String(value).padStart(length, '0');

const contractFileName = (date = new Date()) => (
  `image_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_`
  + `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}_001.jpg`
);

const HintRow = ({ label, value, mono = false }) => (
  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
    <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
    <span className={`text-[11px] text-gray-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

const UsbFrameProbePanel = () => {
  const videoRef = useRef(null);
  const clipVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const streamSeqRef = useRef(0);
  const mountedRef = useRef(false);
  const previewUrlRef = useRef(null);
  const clipUrlRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [testOrigin, setTestOrigin] = useState(TEST_ORIGINS[0]);
  const [captureAuthorized, setCaptureAuthorized] = useState(false);
  const [lastAuthorizedAction, setLastAuthorizedAction] = useState('Ninguna · solo vista previa');

  const [recordingClip, setRecordingClip] = useState(false);
  const [clipBlob, setClipBlob] = useState(null);
  const [clipUrl, setClipUrl] = useState(null);
  const [clipMimeType, setClipMimeType] = useState('');
  const [clipError, setClipError] = useState(null);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [derivedFrom, setDerivedFrom] = useState('');
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(null);
  const [info, setInfo] = useState(null);

  // Detiene el MediaRecorder sin tocar estado de React: también se usa en el unmount.
  const stopRecorderOnly = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // El navegador ya pudo detenerlo al cerrar los tracks; no hay nada más que hacer.
      }
    }
  }, []);

  // Detiene TODOS los tracks y deja el <video> sin fuente. No cambia estado de React.
  const releaseStream = useCallback(() => {
    streamSeqRef.current += 1;
    stopRecorderOnly();
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stopRecorderOnly]);

  const stopCamera = useCallback(() => {
    releaseStream();
    setCameraActive(false);
    setCameraLoading(false);
    // La autorización es por sesión de cámara: al detenerla queda revocada.
    setCaptureAuthorized(false);
  }, [releaseStream]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setVideoDevices([]);
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((device) => device.kind === 'videoinput');
      setVideoDevices(inputs);
      setSelectedDeviceId((current) => {
        if (current && inputs.some((device) => device.deviceId === current)) return current;
        return inputs[0]?.deviceId || '';
      });
    } catch (err) {
      setVideoDevices([]);
      setCameraError(err?.message || 'No fue posible enumerar las cámaras del equipo.');
    }
  }, []);

  const startCamera = useCallback(async (deviceId = selectedDeviceId) => {
    const media = navigator.mediaDevices;
    if (!media?.getUserMedia) {
      setCameraError('Este navegador no expone getUserMedia. Usa HTTPS o localhost y un navegador compatible.');
      return;
    }

    releaseStream();
    setCaptureAuthorized(false);
    setLastAuthorizedAction('Ninguna · cámara activada, esperando autorización');
    const requestId = streamSeqRef.current;
    setCameraError(null);
    setCameraLoading(true);

    try {
      const video = deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' };
      const stream = await media.getUserMedia({ video, audio: false });
      if (!mountedRef.current || streamSeqRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // autoPlay + muted suele bastar; si no, el usuario puede usar el control nativo.
        }
      }
      if (!mountedRef.current || streamSeqRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      setCameraActive(true);
      await refreshDevices();
    } catch (err) {
      if (!mountedRef.current || streamSeqRef.current !== requestId) return;
      setCameraError(err?.message || 'No fue posible activar la cámara.');
      setCameraActive(false);
    } finally {
      if (mountedRef.current && streamSeqRef.current === requestId) setCameraLoading(false);
    }
  }, [refreshDevices, releaseStream, selectedDeviceId]);

  useEffect(() => {
    mountedRef.current = true;
    refreshDevices();
    return () => {
      mountedRef.current = false;
      releaseStream();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      if (clipUrlRef.current) {
        URL.revokeObjectURL(clipUrlRef.current);
        clipUrlRef.current = null;
      }
      chunksRef.current = [];
    };
  }, [refreshDevices, releaseStream]);

  const clearResult = () => {
    setRequestError(null);
    setRaw(null);
    setInfo(null);
  };

  const acceptImage = (imageFile, originalFileName, source) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(imageFile);
    previewUrlRef.current = url;
    setPreview(url);
    setFile(imageFile);
    setFileName(imageFile.name);
    setOriginalName(originalFileName);
    setSourceLabel(source);
    setFileError(null);
    clearResult();
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(null);
    setFileName('');
    setOriginalName('');
    setSourceLabel('');
    setFileError(null);
    setCaptureAuthorized(false);
    setLastAuthorizedAction('Archivo local preparado · pendiente de envío manual');
    clearResult();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreview(null);
    if (!selected) return;

    const mimeOk = typeof selected.type === 'string' && selected.type.startsWith('image/');
    if (!mimeOk && !IMAGE_EXT_RE.test(selected.name)) {
      setFileError('Selecciona un archivo de imagen real (image/*). No se valida ni exige su nombre.');
      return;
    }

    // El nombre del contrato se genera EN MEMORIA: sin renombrados manuales en Windows.
    const normalized = FRAME_FILE_RE.test(selected.name)
      ? selected
      : new File([selected], contractFileName(), {
        type: selected.type || 'image/jpeg',
        lastModified: selected.lastModified || Date.now(),
      });
    acceptImage(normalized, selected.name, 'Archivo local · origen declarado por el usuario');
  };

  const declaredDerivedFrom = derivedFrom.trim();
  const derivedError = declaredDerivedFrom && !VIDEO_ID_RE.test(declaredDerivedFrom)
    ? 'derived_from debe ser video_AAAAMMDD_HHMMSS_mmm[.mp4].'
    : null;
  const blocked = Boolean(fileError || derivedError || !file || loading);

  const submitFrame = async (imageFile, originalFileName, source) => {
    if (derivedError) return;
    acceptImage(imageFile, originalFileName, source);
    setLoading(true);
    clearResult();
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('client_context', CLIENT_CONTEXT);
    // derived_from se declara en el panel como metadato local: el endpoint V3 no lo
    // interpreta y esta etapa no modifica el backend.
    try {
      const response = await fetch(AI_INFERENCE_URL, { method: 'POST', body: formData });
      let data = null;
      try {
        data = await response.json();
      } catch {
        throw new Error('La respuesta oficial de IA no es válida.');
      }
      if (!response.ok || data?.error) {
        throw new Error(
          data?.error?.message || data?.error?.detail || 'No fue posible completar la petición oficial.'
        );
      }
      setRaw(data);
      setInfo(buildInfoFromOfficialResponse(data));
    } catch (err) {
      setRequestError(err.message || 'No fue posible completar la petición oficial.');
    } finally {
      setLoading(false);
    }
  };

  const send = () => {
    if (!file || derivedError) return;
    setLastAuthorizedAction('Frame manual enviado · botón «ENVIAR FRAME»');
    void submitFrame(file, originalName || fileName, sourceLabel || 'Archivo local');
  };

  const captureFrame = () => {
    // Doble condición: casilla marcada Y clic en el botón explícito. Nunca dispara la vista previa.
    if (!cameraActive || !captureAuthorized || !streamRef.current) {
      setCameraError('Marca la autorización en pantalla antes de capturar un frame.');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setCameraError('No se encontró la vista previa o el canvas.');
      return;
    }
    if (!video.videoWidth || !video.videoHeight) {
      setCameraError('La vista previa aún no tiene fotogramas. Espera un instante y vuelve a intentar.');
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('El navegador no permitió crear el contexto 2D del canvas.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCameraError(null);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('No fue posible extraer el fotograma actual del canvas.');
        return;
      }
      const frame = new File([blob], contractFileName(), {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      setLastAuthorizedAction(`Frame capturado y enviado · ${testOrigin}`);
      void submitFrame(frame, 'captura en vivo · cámara real', testOrigin);
    }, 'image/jpeg', 0.92);
  };

  const stopClip = useCallback(() => {
    stopRecorderOnly();
    setRecordingClip(false);
    setLastAuthorizedAction('Clip detenido · pendiente de extracción autorizada');
  }, [stopRecorderOnly]);

  const startClip = () => {
    if (!cameraActive || !captureAuthorized || !streamRef.current) {
      setClipError('Marca la autorización en pantalla antes de grabar un clip.');
      return;
    }
    if (typeof window.MediaRecorder === 'undefined') {
      setClipError('Este navegador no expone MediaRecorder.');
      return;
    }

    if (clipUrlRef.current) {
      URL.revokeObjectURL(clipUrlRef.current);
      clipUrlRef.current = null;
    }
    setClipUrl(null);
    setClipBlob(null);
    setClipMimeType('');
    setClipError(null);

    const mimeType = CLIP_MIME_CANDIDATES.find((candidate) => (
      typeof window.MediaRecorder.isTypeSupported === 'function'
      && window.MediaRecorder.isTypeSupported(candidate)
    )) || '';

    let recorder;
    try {
      recorder = mimeType
        ? new window.MediaRecorder(streamRef.current, { mimeType })
        : new window.MediaRecorder(streamRef.current);
    } catch (err) {
      setClipError(err?.message || 'No fue posible iniciar MediaRecorder.');
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      recorderRef.current = null;
      if (!mountedRef.current) return;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      chunksRef.current = [];
      setRecordingClip(false);
      if (blob.size === 0) {
        setClipError('El clip quedó vacío. Vuelve a autorizar y grabar unos segundos.');
        return;
      }
      const url = URL.createObjectURL(blob);
      clipUrlRef.current = url;
      setClipUrl(url);
      setClipBlob(blob);
      setClipMimeType(blob.type || 'video/webm');
      setLastAuthorizedAction(`Clip en memoria · ${testOrigin}`);
    };
    recorder.onerror = () => {
      recorderRef.current = null;
      if (!mountedRef.current) return;
      chunksRef.current = [];
      setRecordingClip(false);
      setClipError('MediaRecorder informó un error durante la grabación.');
    };

    try {
      recorder.start(250);
    } catch (err) {
      recorderRef.current = null;
      setClipError(err?.message || 'No fue posible iniciar la grabación.');
      return;
    }
    recorderRef.current = recorder;
    setRecordingClip(true);
    setLastAuthorizedAction(`Grabación de clip autorizada · ${testOrigin}`);
  };

  const extractFrameFromClip = () => {
    if (!clipBlob) {
      setClipError('Primero autoriza y graba un clip.');
      return;
    }
    const video = clipVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setClipError('No se encontró el reproductor del clip o el canvas.');
      return;
    }
    if (!video.videoWidth || !video.videoHeight) {
      setClipError('Espera a que el clip cargue sus metadatos antes de extraer un frame.');
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      setClipError('El navegador no permitió crear el contexto 2D del canvas.');
      return;
    }

    const seconds = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setClipError(null);
    canvas.toBlob((blob) => {
      if (!blob) {
        setClipError('No fue posible extraer el fotograma del clip.');
        return;
      }
      const frame = new File([blob], contractFileName(), {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      setLastAuthorizedAction(`Frame extraído del clip en memoria @ ${seconds.toFixed(2)}s · ${testOrigin}`);
      void submitFrame(
        frame,
        `clip en memoria @ ${seconds.toFixed(2)}s`,
        `${testOrigin} · clip local en memoria`
      );
    }, 'image/jpeg', 0.92);
  };

  const handleDeviceChange = (event) => {
    const nextId = event.target.value;
    setSelectedDeviceId(nextId);
    if (cameraActive) startCamera(nextId);
  };

  const prediction = raw?.prediction || {};
  const trace = raw?.trace || {};

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-3">
      <div
        className="rounded-lg border px-3 py-2 text-[11px] leading-snug"
        style={{ borderColor: `${NEON.alert}80`, backgroundColor: 'rgba(127,29,29,0.18)', color: '#FCA5A5' }}
      >
        <p className="font-bold uppercase tracking-widest">Prueba de transporte · autorización explícita · no validación semántica</p>
        <p className="mt-1">
          La cámara permanece apagada hasta tu orden. Con la vista previa encendida NO se captura ni se envía
          nada automáticamente: hace falta marcar la autorización y pulsar el botón correspondiente. El origen
          declarado es una escena real abierta (terraza/plantas domésticas por defecto): <strong>NO</strong> es un
          cultivo productivo cerrado ni el dataset curado PlantVillage. La escena de cámara general está fuera del
          dominio agrícola entrenado; el clasificador servido no la valida. M1 sigue siendo el baseline oficial
          congelado; M2 continúa como challenger validado sin promoción (<span className="font-mono">servir != promover</span>).
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Cámara real · PC / laptop / USB</span>
          <span className="text-[10px] font-mono text-gray-500">
            getUserMedia · enumerateDevices · MediaRecorder
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block text-[10px] uppercase tracking-wider text-gray-500" htmlFor="usb-frame-device">
            Dispositivo de video (videoinput)
            <select
              id="usb-frame-device"
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="mt-1 w-full rounded border border-gray-800 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
            >
              {videoDevices.length === 0
                ? <option value="">No se detectaron cámaras (concede permiso)</option>
                : videoDevices.map((device, index) => (
                  <option key={device.deviceId || `cam-${index}`} value={device.deviceId}>
                    {device.label || `Cámara ${index + 1}`}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => (cameraActive ? stopCamera() : startCamera())}
              disabled={cameraLoading}
              className="flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-widest border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-cyan-700 text-cyan-300 hover:border-cyan-500 hover:text-white"
            >
              {cameraLoading ? 'ACTIVANDO...' : (cameraActive ? 'DETENER CÁMARA' : 'ACTIVAR CÁMARA')}
            </button>
          </div>
        </div>

        <label className="mt-2 block text-[10px] uppercase tracking-wider text-gray-500" htmlFor="usb-frame-origin">
          Origen honesto de la prueba
          <select
            id="usb-frame-origin"
            value={testOrigin}
            onChange={(event) => setTestOrigin(event.target.value)}
            className="mt-1 w-full rounded border border-gray-800 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
          >
            {TEST_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
          </select>
        </label>

        <p className="mt-2 text-[10px] leading-snug text-gray-500">
          La cámara requiere permiso del navegador y HTTPS o localhost. Al detenerla o salir de la vista se
          liberan todos los <span className="font-mono">MediaStreamTrack</span>. La vista previa es solo video en vivo.
        </p>

        <div className="mt-2 overflow-hidden rounded-lg border border-gray-800 bg-black/60">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`block max-h-64 w-full object-contain ${cameraActive ? '' : 'opacity-30'}`}
            aria-label="Vista previa en vivo de la cámara real (no captura automática)"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        {cameraError && <p className="mt-2 text-[11px] font-semibold" style={{ color: NEON.alert }}>{cameraError}</p>}

        <div
          className="mt-3 rounded-lg border px-3 py-2"
          style={{ borderColor: `${NEON.alert}70`, backgroundColor: 'rgba(120,53,15,0.14)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            Paso 2 · autorización explícita (cero disparos automáticos)
          </p>
          <label className="mt-2 flex items-start gap-2 text-[11px] leading-snug text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={captureAuthorized}
              onChange={(event) => {
                setCaptureAuthorized(event.target.checked);
                setLastAuthorizedAction(event.target.checked
                  ? 'Autorización marcada en pantalla · esperando disparo manual'
                  : 'Autorización revocada en pantalla');
              }}
              disabled={!cameraActive}
              className="mt-0.5 h-3.5 w-3.5 accent-cyan-400 disabled:opacity-40"
            />
            <span>
              Ya ubiqué el portátil frente a las plantas y <strong>autorizo capturar/grabar ahora</strong>.
              Marca esta casilla solo cuando estés listo: sin ella no se dispara nada.
            </span>
          </label>
          <p className="mt-2 text-[10px] leading-snug text-gray-400">
            Origen declarado para esta sesión: <span className="font-mono text-gray-200">{testOrigin}</span>.
            Se registra junto a la respuesta; no se presenta como evidencia de cultivo productivo ni como muestra
            del dataset curado.
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={captureFrame}
              disabled={!cameraActive || !captureAuthorized || cameraLoading || loading || recordingClip || Boolean(derivedError)}
              className="py-2 rounded-md text-[11px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-cyan-600 text-cyan-200 hover:border-cyan-400 hover:text-white"
            >
              Autorizar capturar y ENVIAR frame ahora
            </button>
            <button
              type="button"
              onClick={recordingClip ? stopClip : startClip}
              disabled={!cameraActive || !captureAuthorized || cameraLoading || (!recordingClip && loading)}
              className="py-2 rounded-md text-[11px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-600 text-gray-200 hover:border-rose-500 hover:text-white"
            >
              {recordingClip ? 'Detener clip' : 'Autorizar y grabar clip'}
            </button>
          </div>
          {recordingClip && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-300">
              ● Grabando en memoria · no se escribe en disco
            </p>
          )}
          {clipError && <p className="mt-2 text-[11px] font-semibold" style={{ color: NEON.alert }}>{clipError}</p>}
        </div>
      </div>

      {clipUrl && (
        <div className="rounded-lg border border-gray-800 bg-black/30 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Clip local en memoria</p>
            <p className="text-[10px] font-mono text-gray-500">
              {clipMimeType || 'video/webm'} · {clipBlob ? `${clipBlob.size} bytes` : '—'} · sin archivo en disco
            </p>
          </div>
          <video
            ref={clipVideoRef}
            controls
            src={clipUrl}
            className="mt-2 max-h-56 w-full rounded border border-gray-800 bg-black"
            aria-label="Reproductor local del clip grabado en memoria"
          />
          <button
            type="button"
            onClick={extractFrameFromClip}
            disabled={!clipBlob || loading || Boolean(derivedError)}
            className="mt-2 w-full py-2 rounded-md text-[11px] font-bold uppercase tracking-widest border border-cyan-700 text-cyan-200 hover:border-cyan-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Autorizar extracción de frame del clip y enviar
          </button>
          <p className="mt-1 text-[10px] leading-snug text-gray-500">
            Busca el segundo deseado en el reproductor y pulsa el botón: la extracción NO ocurre al detener la grabación.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Entrada manual</span>
          <span className="text-[10px] font-mono text-gray-500">POST {AI_INFERENCE_URL} · client_context={CLIENT_CONTEXT}</span>
        </div>

        <input
          id="usb-frame-probe-file"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <label
          htmlFor="usb-frame-probe-file"
          className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-gray-700 hover:border-cyan-500 hover:bg-cyan-900/10 transition-colors cursor-pointer"
        >
          <span className="text-lg">{preview ? '🖼️' : '📥'}</span>
          <span className="text-[11px] text-gray-300">
            {fileName || 'Cargar cualquier imagen real (sin renombrar)'}
          </span>
        </label>
        {originalName && originalName !== fileName && (
          <p className="mt-1 text-[10px] leading-snug text-gray-500">
            Original: <span className="font-mono">{originalName}</span> · enviada en memoria como{' '}
            <span className="font-mono">{fileName}</span>
          </p>
        )}

        <label className="mt-2 block text-[10px] uppercase tracking-wider text-gray-500" htmlFor="usb-frame-derived">
          derived_from opcional · video_AAAAMMDD_HHMMSS_mmm.mp4
        </label>
        <input
          id="usb-frame-derived"
          type="text"
          value={derivedFrom}
          onChange={(event) => setDerivedFrom(event.target.value)}
          placeholder="video_20261122_192551_001.mp4"
          className="mt-1 w-full rounded border border-gray-800 bg-black/40 px-2 py-1.5 text-[11px] font-mono text-gray-200 placeholder:text-gray-600"
        />

        {fileError && <p className="mt-2 text-[11px] font-semibold" style={{ color: NEON.alert }}>{fileError}</p>}
        {derivedError && <p className="mt-1 text-[11px] font-semibold" style={{ color: NEON.alert }}>{derivedError}</p>}
        {requestError && <p className="mt-1 text-[11px] font-semibold" style={{ color: NEON.alert }}>{requestError}</p>}

        <button
          type="button"
          onClick={send}
          disabled={blocked}
          className="mt-2 w-full py-2 rounded-md text-xs font-bold uppercase tracking-widest border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-700 text-gray-200 hover:border-cyan-600 hover:text-white"
        >
          {loading ? 'ENVIANDO FRAME...' : 'ENVIAR FRAME · SOLO TRANSPORTE'}
        </button>
      </div>

      {preview && (
        <div className="rounded-lg border border-gray-800 bg-black/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
            Frame listo para la petición · {sourceLabel}
          </p>
          <img src={preview} alt="Vista previa del frame capturado o cargado" className="mt-2 max-h-56 w-full object-contain rounded border border-gray-800" />
        </div>
      )}

      <div className="rounded-lg border border-gray-800 bg-black/30 px-3 py-2 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Respuesta oficial · campos clave</p>
          {!info && <p className="text-[10px] text-gray-500">Aún sin respuesta oficial</p>}
        </div>
        <HintRow label="model_status" value={String(info?.modelStatus ?? 'NO_DECLARADO')} mono />
        <HintRow label="model_id" value={String(prediction.model_id ?? '—')} mono />
        <HintRow label="inference_executed" value={String(info?.inferenceExecuted ?? false)} mono />
        <HintRow label="source_mode" value={String(info?.sourceMode ?? '—')} mono />
        <HintRow label="model_contract_version" value={String(info?.modelContractVersion ?? '—')} mono />
        <HintRow
          label="model_sha256"
          value={info?.modelSha256 ? `${info.modelSha256.slice(0, 12)}…` : '—'}
          mono
        />
        <HintRow label="confidence" value={Number(info?.confidence ?? 0).toFixed(4)} mono />
        <HintRow label="inference_origin" value={String(trace.inference_origin ?? '—')} mono />
        <HintRow label="origen de prueba (local)" value={sourceLabel || testOrigin} />
        <HintRow label="autorización (local)" value={lastAuthorizedAction} />
        <HintRow
          label="derived_from (local, no enviado)"
          value={declaredDerivedFrom || '—'}
          mono
        />
        <p className="pt-1 text-[10px] leading-snug text-gray-500">
          Estos valores describen la petición y el artefacto servido. Una confianza alta no valida la escena de
          cámara ni sustituye un diagnóstico agrícola. M2 es challenger validado: servir != promover.
        </p>
      </div>
    </section>
  );
};

export default UsbFrameProbePanel;
