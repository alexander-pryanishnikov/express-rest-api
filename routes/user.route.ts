import { Router } from 'express';
import { Container } from 'typescript-ioc';
import { UserController } from '../controllers/user.controllers';
import * as http from "http";
const jwt = require('../middleware/jwt.middleware');

const router = Router();

const userController: UserController = Container.get(UserController);

router.get('/api/user', userController.find);

router.post('/api/user', userController.create);

router.put('/api/user/:id', userController.update);

router.post('/api/user/login',[jwt], userController.login);

module.exports = router;
