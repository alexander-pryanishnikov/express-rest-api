import jwt from 'jsonwebtoken'
import {Container} from "typescript-ioc";
import {FileService} from '../services/file.service';


const fileService: FileService = Container.get(FileService);
const tokenKey = '1a2b-3c4d-5e6f-7g8h'

const jwtMiddleware = (request, response, next) => {
    console.log('[jwtMiddleware]: check')

    const authorization = request.headers.authorization;

    if (!authorization) {
        return response.status(403).json("Нет токена")
    }

    const users = fileService.get();
    const user = users.find(user => user.token === authorization);

    if (!user) {
        return response.status(403).json("Токен не найден");
    }

    try {
        let decoded = jwt.verify(authorization, tokenKey);

        if (user.id === decoded.id) {
            console.log('[jwtMiddleware]: all is ok')
            return next();
        }

        return response.status(403).json("Токен принадлежит другому пользователю")

    } catch (err) {
        return response.status(403).json({message: 'Невалидный токен'});
    }
}

module.exports = jwtMiddleware
