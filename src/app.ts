import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import * as compression from 'compression';
import * as debug_log from 'debug';

import { PrivateRouter, PublicRouter } from './routes'
import { Config } from './config';

const debug = debug_log('api');

if (typeof process === 'object') {
    process.on('unhandledRejection', (err: any) => console.error(err.stack));
}

(<any> mongoose).Promise = global.Promise;
mongoose.connect(Config.db.mongo.uri, Config.db.mongo.options);

mongoose.connection.on('connected', () => debug('Mongoose connected'));
mongoose.connection.on('disconnected', () => debug('Mongoose disconnected'));
mongoose.connection.on('error', (err: any) => {
    debug('Mongoose error');
    debug(err);
    process.exit();
});

const app = express();

//cors settings
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
    next();
});
app.use(cors());
app.use(compression());

app.use(logger('dev'));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.all('/', (req, res) => res.json({name: process.env.npm_package_name, version: process.env.npm_package_version}));
app.use('/docs', express.static('docs'));
app.use('/fs', express.static('fs'))

app.use(PrivateRouter);
app.use(PublicRouter);

// error handlers
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if(err) {
        let resp: any = {
            message: err.message
        };
        if(!err.status) {
            res.status(400);
            debug('');
            console.error({
                timestamp: new Date(),
                stack: err.stack,
                message: err.message
            });
            debug('');
            if(err.errors) {
                if(Array.isArray(err.errors)) {
                    resp.message = err.errors.map((v: any) => v.message).join(' ');
                } else {
                    resp.message = Object.keys(err.errors).map(field => err.errors[field].message).join(' ');
                }
            }
            if(app.get('env') !== 'production') {
                resp.error = err;
            }
        } else {
            res.status(err.status);
            resp.error = err;
        }
        res.send(resp);
    }
});

export = app;
