import { Router } from 'express';
import { Container } from 'typescript-ioc';
import { UserController } from '../controllers/user.controllers';
const jwt = require('../middleware/jwt.middleware');


const router = Router();

const userController: UserController = Container.get(UserController);

/** TODO: + [VT] 05.08.2021, 17:06: Закрыть все роуты jwt, кроме логина */
router.get('/api/user', userController.find);

router.post('/api/user', userController.create);

router.put('/api/user/:id', userController.update);

router.post('/api/user/login', userController.login);

router.post('/api/file', [jwt], userController.upload)

router.get('/api/file/:name', [jwt], userController.download);

module.exports = router;
