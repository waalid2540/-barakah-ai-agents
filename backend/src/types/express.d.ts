declare module 'express' {
  export interface Request {
    ip?: string;
    connection?: any;
    headers: any;
    params: any;
    query: any;
    body: any;
    path: string;
    originalUrl: string;
    method: string;
    get(header: string): string | undefined;
  }
  
  export interface Response {
    json(data: any): Response;
    status(code: number): Response;
    set(field: string, value: string): Response;
    set(headers: any): Response;
    send(data?: any): Response;
  }
  
  export interface NextFunction {
    (error?: any): void;
  }
  
  export interface Router {
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
    use(...args: any[]): Router;
  }
  
  export interface Application {
    use(...args: any[]): Application;
    listen(port: number, callback?: () => void): any;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
  }
  
  function express(): Application;
  namespace express {
    function json(options?: any): any;
    function urlencoded(options?: any): any;
    function static(path: string): any;
    function Router(): Router;
  }
  
  export = express;
}

declare module 'cors' {
  function cors(options?: any): any;
  export = cors;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export = morgan;
}