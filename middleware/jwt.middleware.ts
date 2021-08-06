import {getDefaultSettings} from "http2";
import jwt from 'jsonwebtoken'
import {Container} from "typescript-ioc";
import {FileService} from '../services/file.service';
import {response} from "express";


const fileService: FileService = Container.get(FileService);
const tokenKey = '1a2b-3c4d-5e6f-7g8h'

const users = fileService.get()

const jwtMiddleware = (req, res, next) => {



	const authorization = req.headers.authorization;

	if(!authorization) {
		response.status(403).json("Нет токена")
	}

	const user = users.find(user => user.token === authorization)

	if (!user) {
		response.status(403).json("Токен не найден")
	}

	console.log(authorization)

	try {
		let decoded = jwt.verify(authorization, tokenKey);
		console.log(decoded)

		if (user.id === decoded.id) {
			next();
		}
		response.status().json("Токен принадлежит другому пользователю")

	} catch (err) {
		return res.status(401).json({message: 'Невалидный токен'});
	}
}

module.exports = jwtMiddleware
