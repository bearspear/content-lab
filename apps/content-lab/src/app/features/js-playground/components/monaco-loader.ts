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

export function loadMonaco(): Promise<void> {
  // If already loaded, return immediately
  if (loadedMonaco && (window as any).monaco) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  const baseUrl = location.origin + `/assets/monaco-editor/min`;

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
