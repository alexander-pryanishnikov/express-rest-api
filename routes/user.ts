import {Router} from 'express'
import {User} from '../models/user'
import * as fs from "fs";
const router = Router()
const express = require("express");

const jsonParser = express.json();

router.get('/',async (req, res) => {

	try {

		const users = await User.findAll()

		await res.status(200).sendfile(users)

	} catch (e) {

		console.log(e)

		await res.status(500).json({
			message: 'Server error'
		})

	}
})

router.post('/', jsonParser, function (req, res) {
	if (!req.body) return res.sendStatus(400)

	var userName = req.body.name

	var userAge = req.body.age

	res.send(User.addUser({name: userName, age: userAge}))
})

router.put('/api/users', jsonParser, function (req, res) {
	if (!req.body) return res.sendStatus(400)

	var userId = req.body.id
	var userName = req.body.name
	var userAge = req.body.age

	var data = fs.readFileSync('users.json', 'utf8')
	var users = JSON.parse(data)
	var user
	for (var i = 0; i < users.length; i++) {
		if (users[i].id == userId) {
			user = users[i]
			break
		}
	}
	// изменяем данные у пользователя
	if (user) {
		user.age = userAge
		user.name = userName
		var data = JSON.stringify(users)
		fs.writeFileSync('users.json', data)
		res.send(user)
	} else {
		res.status(404).send(user)
	}
})



module.exports = router