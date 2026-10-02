// Lo mínimo de cloudflare:workers que usa la web (lib/guide-storage.ts). Los tipos completos
// de `wrangler types` chocan con los del DOM que usan los scripts de los formularios.
declare module 'cloudflare:workers' {
  type R2Object = { size: number; httpMetadata?: { contentType?: string } };
  export const env: {
    GUIAS: {
      head(key: string): Promise<R2Object | null>;
      get(key: string): Promise<(R2Object & { body: ReadableStream }) | null>;
    };
  };
}
