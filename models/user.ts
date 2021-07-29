import * as fs from "fs";
import validator from 'validator';

export class User {
	static id: number;

	static userName: string;
	static age: number;
	static email: string;
	enabled: boolean;


	static async findAll(): Promise<string> {
		return 'users.json';
	}

	static async addUser(p: { name: any; age: any; email: any }) {

		let users = JSON.parse(fs.readFileSync(await this.findAll(), 'utf8'));

		// находим максимальный id
		let id = users.sort((a, b) => {
			return +b.id - (+a.id);
		});

		User.id = id[0].id + 1
		User.userName = p.name;
		User.age = p.age;
		User.email = p.email;

		/** Проверка на почту */
		if (validator.isEmail(User.email)) {

			console.log('Почта введена корректно');

		} else {

			throw new Error('Почта была введена некорректно');

		}

		/**
		 * Очень хотелось сделать через конструктор, но не получилось ;(
		 * Это костыль?
		 */
		let user = {

			id: User.id,
			name: User.userName,
			age: User.age,
			email: User.email

		};

		/** Добавляем пользователя в массив */
		users.push(user);

		/** Сортируем id в JSON файле */
		users.sort(function (a, b) {
			return a.id - b.id;
		});

		/** перезаписываем файл с новыми данными */
		fs.writeFileSync('users.json', JSON.stringify(users));
	}

	static async putUser(p: { id: any; name: any; age: any; email: any }) {

		/** читаем и парсим все данные */
		let users = JSON.parse(fs.readFileSync(await this.findAll(), 'utf8'));

		for (let i = 0; i < users.length; i++) {

			if (users[i].id == p.id) {

				users[i].age = p.age;
				users[i].name = p.name;
				users[i].email = p.email;

				break;

			}

		}

		fs.writeFileSync('users.json', JSON.stringify(users));

	}

}


