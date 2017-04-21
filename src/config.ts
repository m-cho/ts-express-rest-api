import { IDbConfig, IHttpsOptions } from './interfaces';

export module Config {
    export const __SALT: string = 'secret';
    export const jwt_token_secret: string = 'top_secret';
	export const jwt_expires_in: string = '1d';
    export const db: IDbConfig = {
        mongo: {
            uri: 'mongodb://localhost/xyz',
            options: {
                user: '',
                pass: '',
                auth: {
                    authSource: 'admin'
                }
            }
        }
    };
    export const http_port: number = 8000;
    export const https_port: number = 8001;
    export const https_options: IHttpsOptions = {
        key: '',
        cert: ''
    }
}
