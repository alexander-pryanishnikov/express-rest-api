import {Router} from 'express';
import {User} from '../models/user';
const router = Router();
const express = require("express");

const jsonParser = express.json();

router.get('/api/user', async (req, res) => {

	try {

		const users = await User.findAll();

		await res.status(200).sendfile(users);

	} catch (e) {

		console.log(e);

		await res.status(500).json({
			message: 'Server error'
		});

	}
});

router.post('/api/user', jsonParser, function (req, res) {
	if (!req.body) {
		return res.sendStatus(400);
	}

	let userName = req.body.name;

	let userAge = req.body.age;

	let userEmail = req.body.email;

	res.send(User.addUser({name: userName, age: userAge, email: userEmail}));
})

router.put('/api/user/:id', jsonParser, function (req, res) {

	if (!req.body) {
		return res.sendStatus(400);
	}

	let userId = req.params.id;

	let userName = req.body.name;

	let userAge = req.body.age;

	let userEmail = req.body.email;

	res.send(User.putUser({id: userId, name: userName, age: userAge, email: userEmail}));

});

module.exports = router;