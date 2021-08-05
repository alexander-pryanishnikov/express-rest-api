import {Express} from 'express';
import formidable from 'formidable'
import * as jwt from 'jsonwebtoken'
import path from 'path';
import {Container, Inject} from 'typescript-ioc';
import {UserEntity} from '../models/user.entity';
import {FileService} from '../services/file.service';

var fs = require('fs-extra');
const mime = require('mime');
const validator = require('validator');

export class UserController {

    @Inject
    private readonly fileService: FileService = Container.get(FileService);

    public find = (request: Express.request, response: Express.Response): void => {

		/** TODO: [VT] 05.08.2021, 14:16: camelCase */
        const current_users = this.fileService.get();

		/** TODO: [VT] 05.08.2021, 14:16: Результат сразу в ответ клади, без переменной */
        const employee = current_users.map(user => {
            delete user.token
            delete user.password

            return user;
        })

        response.json(employee);

        return response.end();
    }

    public create = (request: Express.Reequest, response: Express.Response): void => {

        const body: Partial<UserEntity> = request.body;

        if (!body.email || !body.name || !body.password) {
            response.status(412);
            response.json({message: 'Нет email или name или пароля'})
            return response.end();
        } else if (!validator.isEmail(body.email)) {
            response.status(412);
            response.json({message: 'Почта введена некорректно'})
            return response.end();
        }

        const users: UserEntity[] = this.fileService.get();

        const id = Math.max(...users.map(user => user.id))

        const user = new UserEntity();

        user.id = id + 1;
        user.email = body.email;
        user.name = body.name;
        user.password = body.password;

        users.push(user);

        this.fileService.set(users);

        response.json(user);

		/** TODO: [VT] 05.08.2021, 14:17: Статус устанавливается через .status(201) и на создание нужен статус 201 */
        return response.json({status: 200});
    }

    public update = (request: Express.request, response: Express.Response): void => {

        const body: Partial<UserEntity> = request.body;

        const users: UserEntity[] = this.fileService.get();

		/** TODO: [VT] 05.08.2021, 14:18: String(body.id) - id пользователя мы берем не из тела, а из req.params.id */
        let user: UserEntity = users.find(user => user.id === parseInt(String(body.id), 0));

		/** TODO: [VT] 05.08.2021, 14:19: Если почту не передали, её и проверять не нужно */
        if (!validator.isEmail(body.email)) {
            response.status(412);
            response.json({message: 'Почта введена некорректно'});
            return response.end();

			/** TODO: [VT] 05.08.2021, 14:19: Данная проверка не имеет смысла */
			/** TODO: [VT] 05.08.2021, 14:20: Использовать надо строгое равенство */
        } else if (body.email == user.email) {
            response.json({message: 'Пользователь с такой почтой уже существует'});
            return response.end();

			/** TODO: [VT] 05.08.2021, 14:21: Совсем не тут надо проверять, нашелся ли у нас такой пользователь */
        } else if (!user) {
            response.status(412);
            response.json({message: 'Пользователь не найден'})
            return response.end();
        }

        /** TODO: [VT] 04.08.2021, 16:53: Не должно быть возможности изменить пароль и токен. +Проверка на занятый и корректный email */
        Object.assign(user, body);

        this.fileService.set(users);

        return response.json({status: 200});
    }

    public login = (request: Express.request, response: Express.Response): void => {

        const body: Partial<UserEntity> = request.body;

        const users: UserEntity[] = this.fileService.get();

        /** TODO: [VT] 04.08.2021, 16:55: Зачем обращаться к request если уже есть body
         * +*/
		/** TODO: [VT] 05.08.2021, 14:22: В body будет только email и password, никакого ID */
        let current: UserEntity = users.find(user => user.id === parseInt(String(body.id), 0));

		/** TODO: [VT] 05.08.2021, 14:22: Тут можно проверить, нашелся ли current (user), если не нашелся -> 404 - Пользователь не существует */

        if (body.email == current.email && body.password == current.password) {

            console.log("Данные корректны")

            const tokenKey = '1a2b-3c4d-5e6f-7g8h'

            /** TODO: [VT] 04.08.2021, 16:56: exp - эта метка времени (т.е. сейчас + 4 часа должно быть)
             * + */
			/** TODO: [VT] 05.08.2021, 14:24: "+ 4 часа" имелось ввиду в милисекунды. Что будет если к 1628162667774 прибавить строковую константу? */
			/** TODO: [VT] 05.08.2021, 14:27:
			 * Читай https://www.npmjs.com/package/jsonwebtoken#
			 * Поиск по странице: "Signing a token with 1 hour of expiration:"
			 *
			 * */
            current.token = jwt.sign({exp: Date.now() + '4h', id: current.id}, tokenKey)

			/** TODO: [VT] 05.08.2021, 14:28: Забрали данные из файла и сохранили обратно, ничего не сделав с ними */
            this.fileService.set(users);

            return response.status(200).json({

                id: current.id,
                email: current.email,
                token: current.token

            });

        } else {

			/** TODO: [VT] 05.08.2021, 14:28: По заданию такой статус ошибки должен приходить? */
            response.status(412);
            response.json({message: 'Неправильная почта или пароль'});
            return response.end();

        }
    }

    public upload = (request: Express.request, response: Express.Response, next): void => {

        const form = formidable({multiples: true});

        form.parse(request, async (err, fields, files) => {

            if (err) {

                next(err);

                return;

            }

            const file = files['data'];

            const f = fs.readFileSync(file.path);

            let filename = Buffer.from(file.name).toString('base64');

            await fs.promises.writeFile(path.join(__dirname, '../', `/uploads/${filename}`), f)

            return response.json({status: 200});

        });

    }

    public download = (request: Express.request, response: Express.Response): void => {

        let filename = Buffer.from(request.params.name).toString('base64');

        let buff = Buffer.from(path.basename(`./uploads/${filename.toString()}`), 'base64');

        response.set('Content-Disposition', `attachment; filename="${buff}"`)
        response.set('Content-Type', mime.lookup(path.basename(`./uploads/${filename.toString()}`)))

        response.send(fs.readFileSync(path.resolve(`./dist/uploads/${filename.toString()}`)))

    }
}


