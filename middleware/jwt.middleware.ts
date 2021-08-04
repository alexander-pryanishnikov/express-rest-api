import {getDefaultSettings} from "http2";
import jwt from 'jsonwebtoken'
import {UserEntity} from "../models/user.entity";
import {FileService} from '../services/file.service';
import {Container} from "typescript-ioc";
import {readFileSync} from "fs";

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

/** TODO: [VT] 04.08.2021, 17:07: Есть сервис для получения списка пользователей */
const users: UserEntity[] = JSON.parse(readFileSync("users.json", 'utf-8'));

const express = require("express");
const app = express();

/** TODO: [VT] 04.08.2021, 17:08: Мы можем просто экспортировать метод, а подключать мидлвару уже по факту */
const jwtMiddleware = app.use((req, res, next) => {

	/** TODO: [VT] 04.08.2021, 17:09: Почему let?  */
	let user = users.find(user => user.id === parseInt(req.body.id, 0))

	if (req.headers.authorization) {

		jwtMiddleware.verify(

			req.headers.authorization.split(' ')[1],
			tokenKey,

			(err, payload) => {

				if (err) {

					next();

				} else if (payload) {

					/** TODO: [VT] 04.08.2021, 17:10: Объект === number ??? */
					if (user === payload.id) {
							req.user = user
							next()
					}

					if (!req.user) {
						next();
					}
				}
			}
		);
	}

	/** TODO: [VT] 04.08.2021, 17:10: Мидлвара пропускает в любом случае дальше? Где 403? */
	next();
});

module.exports = jwtMiddleware
