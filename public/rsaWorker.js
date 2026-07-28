/**
 * RSA WASM Worker
 *
 * Runs the .NET 9 WASM runtime in a dedicated worker thread so all
 * cryptographic operations execute off the main thread — zero UI blocking.
 *
 * This file lives in public/ so Vite serves/ copies it as a raw static asset
 * (no bundling). This is intentional: Vite must NOT bundle dotnet.js imports;
 * the .NET host uses import.meta.url internally to locate blazor.boot.json
 * and .wasm files relative to its own directory.
 *
 * Protocol (postMessage):
 *   Main → Worker: { id: number, method: string, args: unknown[] }
 *   Worker → Main: { id: number, result?: unknown, error?: string }
 *   Worker → Main: { type: "ready" }  (one-time init signal)
 */
/* eslint-env worker */

const dotnetModule = await import('/wasm-core/wwwroot/_framework/dotnet.js');
const { dotnet: dotnetBuilder } = dotnetModule;

const runtime = await dotnetBuilder.create();
const config = runtime.getConfig();
const assemblyExports = await runtime.getAssemblyExports(config.mainAssemblyName);

// Navigate: RsaToolBox.Crossfrom.Core.RsaInteropService
let service = assemblyExports.RsaToolBox;
service = service.Crossfrom;
service = service.Core;
const exports = service.RsaInteropService;

// Signal the main thread that the runtime is ready for calls.
self.postMessage({ type: 'ready' });

// RPC dispatcher — each message carries a unique id for request/response pairing.
self.onmessage = (e) => {
  const { id, method, args } = e.data;
  try {
    const fn = exports[method];
    if (typeof fn !== 'function') {
      self.postMessage({ id, error: 'Unknown method: ' + method });
      return;
    }
    const result = fn(...args);

    // .NET JSExport methods are synchronous, but handle Promises just in case.
    if (result instanceof Promise) {
      result
        .then((value) => self.postMessage({ id, result: value }))
        .catch((err) =>
          self.postMessage({ id, error: err instanceof Error ? err.message : String(err) })
        );
    } else {
      self.postMessage({ id, result });
    }
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
