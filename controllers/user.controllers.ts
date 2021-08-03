import {Express} from 'express';
import {Container, Inject} from 'typescript-ioc';
import {UserEntity} from '../models/user.entity';
import {FileService} from '../services/file.service';
import {get} from "http";
import * as crypto from "crypto"
import * as jwt from 'jsonwebtoken'





const validator = require('validator');

export class UserController {

	@Inject
	private readonly fileService: FileService = Container.get(FileService);

	public find = (request: Express.Request, response: Express.Response): void => {

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

		/** Добавляем пользователя в массив */
		users.push(user);

		/** Сортируем id в JSON файле */
		users.sort(function (a, b) {
			return a.id - b.id;
		});

		/** перезаписываем файл с новыми данными */
		this.fileService.set(users);

		response.json(user);

		return response.end();
	}

	public update = (request: Express.Request, response: Express.Response): void => {

		/** читаем и парсим все данные */
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

		response.status(200);

		return response.end();

	}

	public login = (request: Express.Request, response: Express.Response): void => {

		const body: Partial<UserEntity> = request.body;

		/** читаем и парсим все данные */
		const users: UserEntity[] = this.fileService.get();

		let current: UserEntity = users.find(user => user.id === parseInt(request.body.id, 0));

		if (body.email == current.email && body.password == current.password) {

			console.log("Данные корректны")

			const tokenKey = '1a2b-3c4d-5e6f-7g8h'

			// let head = Buffer.from(
			// 	JSON.stringify({alg: 'HS256', typ: 'jwt'})
			// ).toString('base64')
			// let body = Buffer.from(JSON.stringify(current)).toString(
			// 	'base64'
			// )
			// let signature = crypto
			// 	.createHmac('SHA256', tokenKey)
			// 	.update(`${head}.${body}`)
			// 	.digest('base64')
			//
			// current.token = `${head}.${body}.${signature}`

			current.token = jwt.sign({ exp: 1800, id: current.id }, tokenKey)

			console.log(Math.floor(Date.now() / 1000) + (60 * 60))

			this.fileService.set(users);

			return response.status(200).json({
				id: current.id,
				email: current.email,
				token: current.token
			})

		} else {

			response.status(412);
			response.json({message: 'Неправильная почта или пароль'})
			return response.end();

		}
	}


}


