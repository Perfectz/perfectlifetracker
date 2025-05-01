// Import actual Express types
import * as core from 'express-serve-static-core';
import * as expressType from 'express';

// Extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
      auth?: {
        sub?: string;
        oid?: string;
        [key: string]: unknown;
      };
      userId?: string;
    }
  }
}

// Re-export Express types so they can be imported from 'express'
declare module 'express' {
  export interface Request extends core.Request {}
  export interface Response extends core.Response {}
  export interface NextFunction extends core.NextFunction {}
  export interface Application extends core.Application {}
  export interface Router extends core.Router {}
  export interface CookieOptions extends core.CookieOptions {}
  export interface ErrorRequestHandler extends core.ErrorRequestHandler {}
  export interface RequestHandler extends core.RequestHandler {}
  export interface Send extends core.Send {}
  
  export default expressType;
}

export {}; 