import * as fs from "fs";
import validator from 'validator';

export class User {
	constructor(id: number,
	            userName: string,
	            age: number,
	            email: string) {
		this.id = id;
		this.name = userName;
		this.age = age;
		this.email = email;
	}


	id: number;
	name: string;
	age: number;
	email: string;
	enabled: boolean;


	static async findAll(): Promise<JSON> {
		return JSON.parse(fs.readFileSync('users.json', "utf-8"));
	}

	static async addUser(p: { name: string; age: number; email: string }): Promise<JSON> {

		// const users = JSON.parse()await this.findAll()
		const users = JSON.parse(fs.readFileSync('users.json', "utf-8"));

		// находим максимальный id
		const id = users.sort((a, b) => {
			return +b.id - (+a.id);
		});

		const user = new User(id[0].id + 1, p.name, p.age, p.email);

		/** Проверка на почту */
		if (validator.isEmail(user.email)) {

			console.log('Почта введена корректно');

		} else {

			throw new Error('Почта была введена некорректно');

		}

		/** Добавляем пользователя в массив */
		users.push(user);

		/** Сортируем id в JSON файле */
		users.sort(function (a, b) {
			return a.id - b.id;
		});

		/** перезаписываем файл с новыми данными */
		fs.writeFileSync('users.json', JSON.stringify(users));

		return users;
	}

	static async putUser(p: { id: number; name: string; age: number; email: string }): Promise<JSON> {

		/** читаем и парсим все данные */
		const users = JSON.parse(fs.readFileSync("users.json", 'utf8'));

		// if (users.find(id => id == p.id)) {
		// 	users[p.id].age = p.age;
		// 	users[p.id].name = p.name;
		// 	users[p.id].email = p.email;
		// } else {
		// 	throw new Error("Такого пользоваеля нет")
		// }
		for (let i = 0; i < users.length; i++) {

			if (users[i].id == p.id) {

				users[i].age = p.age;
				users[i].name = p.name;
				users[i].email = p.email;

				break;

			}

		}

		console.log(users[p.id])



		fs.writeFileSync('users.json', JSON.stringify(users));

		return users;

	}

}


