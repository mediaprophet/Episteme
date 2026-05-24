declare module 'express' {
  export interface Request {}
  export interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
  }
  export interface NextFunction {}
}
declare module 'socks-proxy-agent' {
  export class SocksProxyAgent {
    constructor(url: string);
  }
}
declare module '@ldo/solid-react' {
  export function useResource(uri: string): any;
  export function useSubject(shapeType: any, uri: string): any;
}
declare module 'obsidian' {
  export class Plugin {}
  export interface ObsidianProtocolData {}
}
declare module 'soukai' {
  export function bootSoukai(): void;
  export function setEngine(engine: any): void;
  export const FieldType: any;
}
declare module 'soukai-solid' {
  export class SolidModel {
    static boot(name: string, schema: any): void;
  }
  export function bootSolidModels(): void;
  export class SolidEngine {
    constructor(fetch: any);
  }
}
declare module 'csv-parser' {
  const csv: any;
  export default csv;
}
declare module '@inrupt/solid-client-authn-browser' {
  export const fetch: any;
  export class Session {
    info: { webId?: string; isLoggedIn: boolean };
    fetch: any;
    login(options: any): Promise<void>;
    handleIncomingRedirect(options: any): Promise<void>;
  }
  export function login(options: any): Promise<void>;
  export function handleIncomingRedirect(url?: string): Promise<any>;
  export function getDefaultSession(): any;
}
declare module '*/.shapes/SolidProfileShape' {
  export const SolidProfileShapeType: any;
}
declare module '../.shapes/SolidProfileShape' {
  export const SolidProfileShapeType: any;
}
