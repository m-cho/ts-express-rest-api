import { UserModel } from './../models/UserModel';
import { Request, Response, NextFunction } from 'express';
import { IController, IRoute, IRequest } from './../interfaces';

class UserController implements IController {
	routes: Array<IRoute>;
	constructor() {
		this.routes = [
			{ url: '/users/signup', method: 'post', handler: this.signup, public: true },
			{ url: '/users/signin', method: 'post', handler: this.signin, public: true },
			{ url: '/users/me', method: 'get', handler: this.me },
		]
	}

	async signup(req: Request, res: Response, next: NextFunction) {
		try {
			const user = await UserModel.signup(req.body);
			res.json(user);
		} catch(err) {
			next(err);
		}
	}

	async signin(req: Request, res: Response, next: NextFunction) {
		try {
			const signInResp = await UserModel.signin(req.body);
			res.json(signInResp);
		} catch(err) {
			next(err);
		}
	}

	me(req: IRequest, res: Response, next: NextFunction) {
		res.json(req.user)
	}
}

export = new UserController();
