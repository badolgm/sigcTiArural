/**
 * AudioWorkletProcessor: emite bloques Float32 contiguos al main thread.
 * Solo se emite cuando el port está "escuchando". No añade efectos.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._active = true;
  }

  process(inputs) {
    if (!this._active) return true;
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const ch = input[0];
    if (!ch || ch.length === 0) return true;
    this.port.postMessage(ch.slice());
    return true;
  }

  stop() {
    this._active = false;
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
