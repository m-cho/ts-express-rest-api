import { IController, IRequest } from './interfaces';
import { Config } from './config';
import { Router, Response, NextFunction, Request } from 'express';
import * as fs from 'fs';
import {UserModel} from './models/UserModel';
import * as debug_log from 'debug';
const debug = debug_log('api');

let PrivateRouter: any = Router();

function checkAccessToken(req: IRequest, res: Response, next: NextFunction) {
	const auth_token = (req.get("authorization") || '').split("Bearer ").pop();
    const access_token = auth_token || req.query.access_token;
    if (!access_token) return next({ message: 'No access token', status: 401 });

    UserModel.checkAccessToken(access_token)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => next(err));
}

let PublicRouter: any = Router();

fs.readdir(__dirname + '/controllers', (err, files) => {
    (files || []).forEach(file => {
        const Controller: IController = require(__dirname + '/controllers/' + file);
		if (!Object.keys(Controller || {}).length) debug('\x1b[41mSome controller is not exported as object instance ');
        (Controller.params || []).forEach(param => {
            PrivateRouter.param(param.param, param.handler);
        });
        (Controller.routes || []).forEach(route => {
            if (route.public) {
                let handlers = ([]).concat(route.middlewares || []).concat(route.handler)
                PublicRouter[route.method](route.url, handlers);
            } else {
                let handlers = ([checkAccessToken]).concat(route.middlewares || []).concat(route.handler)
                PrivateRouter[route.method](route.url, handlers);
            }
        });
    })
});

export { PublicRouter, PrivateRouter };
