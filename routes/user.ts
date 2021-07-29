import {Router} from 'express';
import {User} from '../models/user';
const router = Router();
const express = require("express");

const jsonParser = express.json();

router.get('/api/user', async (req, res) => {

	try {

		const users = await User.findAll();

		await res.status(200).send(users);

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

	res.send(User.addUser({name: req.body.name, age: req.body.age, email: req.body.email}));
})

router.put('/api/user/:id', jsonParser, function (req, res) {

	if (!req.body) {
		return res.sendStatus(400);
	}

	res.send(User.putUser({id: req.params.id, name: req.body.name, age: req.body.age, email: req.body.email}));

});

module.exports = router;