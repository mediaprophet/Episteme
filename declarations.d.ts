// ─── Express stubs ────────────────────────────────────────────────────────────
declare module 'express' {
  export interface Request {
    headers: Record<string, string | string[] | undefined>;
  }
  export interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
  }
  // NextFunction is callable
  export interface NextFunction {
    (err?: any): void;
  }
}

// ─── Socks proxy agent ────────────────────────────────────────────────────────
declare module 'socks-proxy-agent' {
  export class SocksProxyAgent {
    constructor(url: string);
  }
}

// ─── LDO / Solid React ────────────────────────────────────────────────────────
declare module '@ldo/solid-react' {
  export function useResource(uri: string): any;
  export function useSubject(shapeType: any, uri: string): any;
}

// ─── Obsidian ─────────────────────────────────────────────────────────────────
declare module 'obsidian' {
  export class Plugin {
    registerObsidianProtocolHandler(scheme: string, handler: (params: ObsidianProtocolData) => any): void;
    addCommand(opts: { id: string; name: string; callback: () => any }): void;
  }
  export interface ObsidianProtocolData {
    action: string;
    [key: string]: string;
    code: string;
    state: string;
  }
}

// ─── Chrome extension APIs ────────────────────────────────────────────────────
declare const chrome: {
  identity: {
    getRedirectURL(path: string): string;
    launchWebAuthFlow(
      details: { url: string; interactive: boolean },
      callback: (responseUrl?: string) => void
    ): void;
  };
  runtime: {
    lastError?: { message: string };
  };
  storage: {
    local: {
      set(items: Record<string, any>): Promise<void>;
    };
  };
};

// ─── Soukai ───────────────────────────────────────────────────────────────────
declare module 'soukai' {
  export function bootSoukai(): void;
  export function setEngine(engine: any): void;
  export const FieldType: {
    String: string;
    Array: string;
    Key: string;
    [key: string]: any;
  };
}

declare module 'soukai-solid' {
  export class SolidModel {
    [key: string]: any;
    static boot(name: string, schema: any): void;
    static find(url: string): Promise<SolidModel | null>;
    static rdfsClasses: string[];
    static rdfContexts: Record<string, string>;
    static fields: Record<string, any>;
    static timestamps: boolean;
    save(containerUrl?: string): Promise<void>;
    get url(): string;
    constructor(attrs?: Record<string, any>);
  }
  export function bootSolidModels(): void;
  export class SolidEngine {
    constructor(fetch: any);
  }
}

// ─── CSV parser ───────────────────────────────────────────────────────────────
declare module 'csv-parser' {
  import { Transform } from 'stream';
  function csv(options?: any): Transform;
  export = csv;
}

// ─── Inrupt authn browser ─────────────────────────────────────────────────────
declare module '@inrupt/solid-client-authn-browser' {
  export const fetch: typeof globalThis.fetch;
  export class Session {
    info: { webId?: string; isLoggedIn: boolean; sessionId?: string };
    fetch: typeof globalThis.fetch;
    login(options: any): Promise<void>;
    handleIncomingRedirect(options?: string | { restorePreviousSession?: boolean }): Promise<{ webId?: string; isLoggedIn: boolean } | undefined>;
  }
  export function login(options: any): Promise<void>;
  export function handleIncomingRedirect(options?: string | { restorePreviousSession?: boolean }): Promise<{ webId?: string; isLoggedIn: boolean } | undefined>;
  export function getDefaultSession(): Session;
}

// ─── Inrupt authn node ────────────────────────────────────────────────────────
declare module '@inrupt/solid-client-authn-node' {
  export const fetch: typeof globalThis.fetch;
  export class Session {
    info: { webId?: string; isLoggedIn: boolean };
    fetch: typeof globalThis.fetch;
    login(options: any): Promise<void>;
    handleIncomingRedirect(url?: string): Promise<void>;
  }
}

// ─── LDO shape stubs ─────────────────────────────────────────────────────────
declare module '*/.shapes/SolidProfileShape' {
  export const SolidProfileShapeType: any;
}
declare module '../.shapes/SolidProfileShape' {
  export const SolidProfileShapeType: any;
}
