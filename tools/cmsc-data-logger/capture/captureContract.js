export function missingCaptureFields(requiredIds, getValue) {
  return requiredIds.filter((id) => !getValue(id).trim());
}

export const CAPTURE_DURATION_S = 3;

export function targetCaptureSamples(sampleRate) {
  return Math.round(CAPTURE_DURATION_S * sampleRate);
}

export function captureChunk(input, capturedSamples, targetSamples) {
  const remaining = Math.max(0, targetSamples - capturedSamples);
  return input.slice(0, Math.min(input.length, remaining));
}