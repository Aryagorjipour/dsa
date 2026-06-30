import ortMjs from '../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs?url'
import ortWasm from '../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm?url'
import piperWasm from '../../../node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm?url'
import piperData from '../../../node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data?url'

const ortWasmPaths = { mjs: ortMjs, wasm: ortWasm }

let ortConfigured = false

/**
 * Piper sets ort.env.wasm.wasmPaths to a broken cdnjs directory string.
 * Pin Vite-resolved ?url assets so ONNX loads via fetch, not Vite module graph.
 */
export async function ensureOrtWasmConfigured(): Promise<void> {
  if (ortConfigured) return

  const ort = await import('onnxruntime-web')
  ort.env.wasm.numThreads = 1

  const wasmEnv = ort.env.wasm as { wasmPaths?: unknown }
  try {
    Object.defineProperty(wasmEnv, 'wasmPaths', {
      get: () => ortWasmPaths,
      set: () => {
        /* ignore piper CDN prefix override */
      },
      configurable: true,
      enumerable: true,
    })
  } catch {
    wasmEnv.wasmPaths = ortWasmPaths
  }

  ortConfigured = true
}

export function getPiperWasmPaths(): {
  onnxWasm: string
  piperWasm: string
  piperData: string
} {
  return {
    onnxWasm: '/unused/',
    piperWasm,
    piperData,
  }
}