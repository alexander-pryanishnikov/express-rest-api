import {Express} from 'express';
import formidable from 'formidable'
import * as jwt from 'jsonwebtoken'
import path from 'path';
import {Container, Inject} from 'typescript-ioc';
import {log} from "util";
import {UserEntity} from '../models/user.entity';
import {FileService} from '../services/file.service';

var fs = require('fs-extra');
const mime = require('mime');
const validator = require('validator');
const md5 = require('md5');

/** TODO: + [VT] 06.08.2021, 12:52: Не тут */
const tokenKey = '1a2b-3c4d-5e6f-7g8h'

export class UserController {

	@Inject
	private readonly fileService: FileService = Container.get(FileService);

	public find = (request: Express.request, response: Express.Response): void => {

		const currentUsers = this.fileService.get();

		response.json(currentUsers.map(user => {
			delete user.token
			delete user.password

			return user;
		}));

		return response.end();
	}

	public create = (request: Express.Reequest, response: Express.Response): void => {

		const body: Partial<UserEntity> = request.body;

		const users: UserEntity[] = this.fileService.get();

		if (!body.email || !body.name || !body.password) {
			response.status(412);
			response.json({message: 'Нет email или name или пароля'})
			return response.end();

			/** TODO: + [VT] 06.08.2021, 12:49: Проверка на занятый email */
		} else if (body.email && users.find(u => u.email === body.email && u.id !== +request.params.id)) {

			response.json({message: 'Пользователь с такой почтой уже существует'});
			return response.end();

		} else if (!validator.isEmail(body.email)) {
			response.status(412);
			response.json({message: 'Почта введена некорректно'})
			return response.end();
		}


		const id = Math.max(...users.map(user => user.id))

		const user = new UserEntity();

		user.id = id + 1;
		user.email = body.email;
		user.name = body.name;
		user.password = md5(body.password);
		user.enabled = true;

		users.push(user);

		this.fileService.set(users);

		/** TODO: + [VT] 06.08.2021, 12:50: В ответе не должно пароля */
		delete user.password
		response.send(user);

		return response.status(201).send();
	}

	public update = (request: Express.request, response: Express.Response): void => {


		const body: Partial<UserEntity> = request.body;

		const users: UserEntity[] = this.fileService.get();

		let user: UserEntity = users.find(user => user.id === parseInt(String(request.params.id), 0));

		if (!user) {

			response.status(412);
			response.json({message: 'Пользователь не найден'})
			return response.end();

		} else if (body.email && users.find(u => u.email === body.email && u.id !== +request.params.id)) {

			response.json({message: 'Пользователь с такой почтой уже существует'});
			return response.end();

		} else if (body.email && !validator.isEmail(body.email)) {

			response.status(412);
			response.json({message: 'Почта введена некорректно'});
			return response.end();

		}

		delete body.token
		delete body.password

		Object.assign(user, body);

		this.fileService.set(users);

		return response.status(200).send();
	}

	public login = (request: Express.request, response: Express.Response): void => {

		const body: Partial<UserEntity> = request.body;

		const users: UserEntity[] = this.fileService.get();

		const current: UserEntity = users.find(user => user.email === body.email);

		if (!current) {
			/** TODO: + [VT] 06.08.2021, 12:52: Описать ошибку */
			return response.status(404).send("Пользователь не найден")
		}

		/** TODO: + [VT] 06.08.2021, 12:48: Проверять user.enabled */
		if(!current.enabled) {
			return response.status(403).send("Пользователь заблокирован")
		}

		if (md5(body.password) === current.password) {

			console.log("Данные корректны")

			current.token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60) * 4, id: current.id}, tokenKey)

			this.fileService.set(users);

			return response.status(200).json({

				id: current.id,
				email: current.email,
				token: current.token

			});

		} else {

			response.status(401);
			response.json({message: 'Неправильная почта или пароль'});
			return response.end();

		}
	}

	public upload = (request: Express.request, response: Express.Response, next): void => {

		const form = formidable({multiples: true});

		form.parse(request, async (err, fields, files) => {

			if (err) {

				next(err);

				return;

			}

			const file = files['data'];

			const f = fs.readFileSync(file.path);

			let filename = Buffer.from(file.name).toString('base64');

			await fs.promises.writeFile(path.join(__dirname, '../', `/uploads/${filename}`), f)

			return response.json({status: 200});

		});

	}

	public download = (request: Express.request, response: Express.Response): void => {

		let filename = Buffer.from(request.params.name).toString('base64');

		let buff = Buffer.from(path.basename(`./uploads/${filename.toString()}`), 'base64');

		response.set('Content-Disposition', `attachment; filename="${buff}"`)
		response.set('Content-Type', mime.lookup(path.basename(`./uploads/${filename.toString()}`)))

		response.send(fs.readFileSync(path.resolve(`./dist/uploads/${filename.toString()}`)))

	}
}


