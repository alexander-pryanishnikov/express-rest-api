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

const tokenKey = '1a2b-3c4d-5e6f-7g8h'


export class UserController {

    @Inject
    private readonly fileService: FileService = Container.get(FileService);

    public find = (request: Express.request, response: Express.Response): void => {

        /** TODO: [VT] 04.08.2021, 16:48:
         * То есть, мы возвращаем всех пользователей с их паролями и токенами?
         * Не безопасно
         * */
        /** + */
        const current_users = this.fileService.get();

        const users = JSON.stringify(current_users, function(key, value) {
            if (key == 'password' ) {
                return undefined; // удаляем все строковые свойства
            } else if (key == 'token') {
                return  undefined;
            }
            return value;
        })

        response.json(JSON.parse(users));

        return response.end();
    }

    public create = (request: Express.Reequest, response: Express.Response): void => {

        const user = new UserEntity();

        /** Проверка на почту */
        /** TODO: [VT] 04.08.2021, 16:50: Выполнено уже много действий и тут мы решаем проверить на корректность email. Такие проверки надо делать в начале */
        /** + */
        if (!validator.isEmail(user.email)) {
            response.status(412);
            response.json({message: 'Почта введена некорректно'})
            return response.end();
        }

        const body: Partial<UserEntity> = request.body;

        if (!body.email || !body.name || !body.password) {
            response.status(412);
            response.json({message: 'Нет email или name или пароля'})
            return response.end();
        }

        const users: UserEntity[] = this.fileService.get();

        // находим максимальный id
		/** TODO: [VT] 04.08.2021, 16:49: Можно проще через reduce или Math */


        // const id: number = users.sort((a, b) => {
        //     return +b.id - (+a.id);
        // }).find((v, i) => i === 0).id;


        // user.id = id + 1;
        // user.email = request.body.email;
        // user.name = request.body.name;
        // user.password = request.body.password;
        //
        // users.push(user);

		/** TODO: [VT] 04.08.2021, 16:52: Сортировка по факту не нужна */
        /** Сортируем id в JSON файле */
        // users.sort(function (a, b) {
        //     return a.id - b.id;
        // });

        this.fileService.set(users);

        response.json(user);

		/** TODO: [VT] 04.08.2021, 16:54: Статус ответа? */
        return response.end();
    }

    public update = (request: Express.request, response: Express.Response): void => {

        const users: UserEntity[] = this.fileService.get();

        let current: UserEntity = users.find(user => user.id === parseInt(request.params.id, 0));

        if (!current) {
            response.status(412);
            response.json({message: 'Пользователь не найден'})
            return response.end();
        }

        const body: Partial<UserEntity> = request.body;

		/** TODO: [VT] 04.08.2021, 16:53: Не должно быть возможности изменить пароль и токен. +Проверка на занятый и корректный email */
        Object.assign(current, body);

        this.fileService.set(users);

        return response.json({status: 200});
    }

    public login = (request: Express.request, response: Express.Response): void => {

        const body: Partial<UserEntity> = request.body;

        const users: UserEntity[] = this.fileService.get();

		/** TODO: [VT] 04.08.2021, 16:55: Зачем обращаться к request если уже есть body */
        let current: UserEntity = users.find(user => user.id === parseInt(request.body.id, 0));

        if (body.email == current.email && body.password == current.password) {

            console.log("Данные корректны")

            const tokenKey = '1a2b-3c4d-5e6f-7g8h'

            /** TODO: [VT] 04.08.2021, 16:56: exp - эта метка времени (т.е. сейчас + 4 часа должно быть) */
            current.token = jwt.sign({exp: 1800, id: current.id}, tokenKey)

            console.log(Math.floor(Date.now() / 1000) + (60 * 60));

            this.fileService.set(users);

            return response.status(200).json({

                id: current.id,
                email: current.email,
                token: current.token

            });

        } else {

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


