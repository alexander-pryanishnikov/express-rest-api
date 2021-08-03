import {UserEntity} from "../models/user.entity";
import {readFileSync} from "fs";

export const tokenKey = '1a2b-3c4d-5e6f-7g8h'

const users: UserEntity[] = JSON.parse(readFileSync("users.json", 'utf-8'));

const express = require("express");
const app = express();

const jwtMiddleware = app.use((req, res, next) => {

	let user = users.find(user => user.id === parseInt(req.body.id, 0))

	if (req.headers.authorization) {

		jwtMiddleware.verify(

			req.headers.authorization.split(' ')[1],
			tokenKey,

			(err, payload) => {

				if (err) {

					next();

				} else if (payload) {

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

	next();

});

module.exports = jwtMiddleware