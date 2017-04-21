import { ISignInResponse } from './../interfaces'
import { Box } from './../utils/Box'
import * as mongoose from 'mongoose'
import * as jwt from 'jsonwebtoken'
import { Config } from "../config"

export interface IUser extends mongoose.Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type : String , unique : true, required : true, dropDups: true },
    password: { type: String, required: true },

}, { collection: 'users', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } )

UserSchema.statics.checkAccessToken = (access_token: string): Promise<IUser> => {
	return new Promise<IUser>((resolve, reject) => {
        jwt.verify(access_token, Config.jwt_token_secret, (err, decoded_token) => {
			if(err) return reject({message: 'Bad Token', status: 401})
			UserModel.findOne({_id: decoded_token._id})
            .then(user => {
				if(!user) return Promise.reject({message: 'User not found', status: 401})
				resolve(user)
			})
            .catch(err => reject(err))
		})
    })
}

UserSchema.statics.signup = async (body: any): Promise<IUser> => {
	try {
		const user = await UserModel.findOne({
			email: body.email
		});
		if(user) return Promise.reject({message: 'Email already in use.', status: 400})
	} catch(err) {
		return Promise.reject(err);
	}
	return await UserModel.doCreate(body);
}

UserSchema.statics.signin = async (body: any): Promise<ISignInResponse> => {
	if(!body.email) return Promise.reject({message: 'Email required', status: 400});
	if(!body.password) return Promise.reject({message: 'Password required', status: 400});
	body.password = Box.cryptPass(body.password);
	let user;
	try {
		user = await UserModel.findOne({
			email: body.email,
			password: body.password
		});
	} catch(err) {
		return Promise.reject(err);
	}
	if(!user) return Promise.reject({message: 'Email or Password invalid.', status: 400});
	const accessToken = jwt.sign({_id: user._id}, Config.jwt_token_secret, {expiresIn: Config.jwt_expires_in})
	const resp: ISignInResponse = {
		_id: user._id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
		access_token: accessToken,
	};
	return resp;
}

UserSchema.statics.doCreate = async (body: any): Promise<IUser> => {
	if(!body.email) return Promise.reject({message: 'Email required', status: 400});
	if(!body.password) return Promise.reject({message: 'Password required', status: 400});
	body.password = Box.cryptPass(body.password);

	try {
		const user = new UserModel(body);
		return await user.save();
	} catch(err) {
		return Promise.reject(err);
	}
}

interface IUserModel extends mongoose.Model<IUser> {
    checkAccessToken: (access_token: string) => Promise<IUser>;
    doCreate: (body: any) => Promise<IUser>;
    signup: (body: any) => Promise<IUser>;
    signin: (body: any) => Promise<ISignInResponse>;
}
export const UserModel = <IUserModel>mongoose.model<IUser>('UserModel', UserSchema);
