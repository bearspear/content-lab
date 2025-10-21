export type Monaco = typeof import('monaco-editor');

export interface Require {
  <T>(deps: string[], callback: (result: T) => void): void;
  config(options: {
    baseUrl: string;
    paths: {
      [key: string]: string;
    };
  }): void;
}

function getRequire(): Require | undefined {
  return (window as any)['require'] as unknown as Require;
}

let loadedMonaco = false;
let loadingPromise: Promise<void> | null = null;

// Ensure MonacoEnvironment is configured before Monaco loads
function ensureMonacoEnvironment(): void {
  if ((window as any).MonacoEnvironment) {
    return; // Already configured
  }

  (window as any).MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
      // Use relative paths for Electron (file://) and web servers
      // This works in both environments because base href is set to "./"
      const baseUrl = './assets/monaco-editor/min/vs';

      if (label === 'json') {
        return `${baseUrl}/language/json/jsonWorker.js`;
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return `${baseUrl}/language/css/cssWorker.js`;
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return `${baseUrl}/language/html/htmlWorker.js`;
      }
      if (label === 'typescript' || label === 'javascript') {
        return `${baseUrl}/language/typescript/tsWorker.js`;
      }
      // Default editor worker
      return `${baseUrl}/base/worker/workerMain.js`;
    }
  };
}

export function loadMonaco(): Promise<void> {
  // Ensure MonacoEnvironment is set before loading
  ensureMonacoEnvironment();

  // If already loaded, return immediately
  if (loadedMonaco && (window as any).monaco) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Use relative path for Electron (file://) and web servers
  // This works in both environments because base href is set to "./"
  const baseUrl = './assets/monaco-editor/min';

  loadingPromise = new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if ((window as any).monaco && getRequire()) {
      loadedMonaco = true;
      return resolve();
    }

    const loaderScript = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.src = `${baseUrl}/vs/loader.js`;

    loaderScript.addEventListener('load', () => {
      getRequire()!.config({
        baseUrl,
        paths: { vs: 'vs' },
      });

      getRequire()!(['vs/editor/editor.main'], () => {
        loadedMonaco = true;
        resolve();
      });
    });

    loaderScript.addEventListener('error', (error) => {
      loadingPromise = null;
      reject(error);
    });

    document.body.appendChild(loaderScript);
  });

  return loadingPromise;
}

export function getMonaco(): Monaco | undefined {
  return (window as any).monaco;
}
