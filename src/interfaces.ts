import { IUser } from './models/UserModel';
import { Request, RequestHandler, RequestParamHandler } from 'express';

export interface IHttpsOptions {
    key: string;
    cert: string;
    passphrase?: string;
}

export interface IDbConfig {
    mongo: {
        uri: string;
        options: {
            user: string;
            pass: string;
            auth: {
                authSource: string
            }
        }
    }
}

export interface IRoute {
    method: string;
    role?: Array<string>;
    public?: boolean;
    url: string;
    handler: RequestHandler
    middlewares?: Array<RequestHandler>
}

export interface IParam {
    param: string;
    handler: RequestParamHandler;
}

export interface IController {
    routes: Array<IRoute>;
    params?: Array<IParam>;
}

export interface IRequest extends Request {
    user: IUser
    role: string
}

export interface ISignInResponse {
	_id: string;
	email: string;
	first_name: string;
	last_name: string;
	access_token: string;
}
