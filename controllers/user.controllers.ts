import {Express} from 'express';
import {Container, Inject} from 'typescript-ioc';
import {UserEntity} from '../models/user.entity';
import {FileService} from '../services/file.service';
import * as jwt from 'jsonwebtoken'
import path from 'path';
import multer from 'multer'
import formidable from 'formidable'
import {log} from "util";
import {readFileSync} from "fs";
var fs = require('fs-extra');
const mime = require('mime');
const validator = require('validator');

const tokenKey = '1a2b-3c4d-5e6f-7g8h'


export class UserController {

	@Inject
	private readonly fileService: FileService = Container.get(FileService);

	public find = (request: Express.request, response: Express.Response): void => {

		const users = this.fileService.get();

		response.json(users);

		return response.end();
	}

	public create = (request: Express.Reequest, response: Express.Response): void => {

		const body: Partial<UserEntity> = request.body;

		if (!body.email || !body.name || !body.password) {
			response.status(412);
			response.json({message: 'Нет email или name или пароля'})
			return response.end();
		}

		const users: UserEntity[] = this.fileService.get();

		// находим максимальный id
		const id: number = users.sort((a, b) => {
			return +b.id - (+a.id);
		}).find((v, i) => i === 0).id;

		const user = new UserEntity();

		user.id = id + 1;
		user.email = request.body.email;
		user.name = request.body.name;
		user.password = request.body.password;

		/** Проверка на почту */
		if (!validator.isEmail(user.email)) {
			response.status(412);
			response.json({message: 'Почта введена некорректно'})
			return response.end();
		}

		users.push(user);

		/** Сортируем id в JSON файле */
		users.sort(function (a, b) {
			return a.id - b.id;
		});

		this.fileService.set(users);

		response.json(user);

		return response.end();
	}

	public update = (request: Express.request, response: Express.Response): void => {

		const users: UserEntity[] = this.fileService.get();

		let current: UserEntity = users.find(user => user.id === parseInt(request.params.id, 0));

		if (!current) {
			response.status(412);
			response.json({message: 'Пользователь не найден'})
			return response.end();
		}

		const body: Partial<UserEntity> = request.body;

		Object.assign(current, body);

		this.fileService.set(users);

		return response.json({status: 200});
	}

	public login = (request: Express.request, response: Express.Response): void => {

		const body: Partial<UserEntity> = request.body;

		const users: UserEntity[] = this.fileService.get();

		let current: UserEntity = users.find(user => user.id === parseInt(request.body.id, 0));

		if (body.email == current.email && body.password == current.password) {

			console.log("Данные корректны")


			current.token = jwt.sign({exp: 1800, id: current.id}, tokenKey)

			console.log(Math.floor(Date.now() / 1000) + (60 * 60));

			this.fileService.set(users);

			return response.json({status: 200});
			// return response.status(200).json({
			//
			// 	id: current.id,
			// 	email: current.email,
			// 	token: current.token
			//
			// });

		} else {

			response.status(412);
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

		response.send(fs.readFileSync(filename))

	}
}


