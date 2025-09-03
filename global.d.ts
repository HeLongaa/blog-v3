declare global {
  interface Window {
    katex: {
      renderToString: (tex: string, options?: { displayMode?: boolean }) => string;
    };
  }
}

export {};