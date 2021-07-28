import * as fs from "fs";

export class User {
	static id: number;
	// @ts-ignore
	static name: string;
	static age: number;
	email: string;
	enabled: boolean;

	static async findAll() {
		return 'users.json'
	}

	static async addUser(p: { name: any; age: any }) {
		var data = fs.readFileSync('users.json', 'utf8')
		var users;

		// console.log(p)

		typeof data === "string" ?
			users = JSON.parse(data)
			:
			users = data;


		// console.log(users)

		// находим максимальный id
		let id = users.sort((a, b) => {
			return +b.id - (+a.id)
		})

		// @ts-ignore
		JSON.stringify(p)

		// console.log(User.name)


		User.id = id[0].id + 1
		// User.name = "Имя"
		// User.age = p.age

		// добавляем пользователя в массив
		users.push(User.id)
		console.log(User)
		// @ts-ignore
		var data = JSON.stringify(users)

		// console.log(data)
		// перезаписываем файл с новыми данными
		fs.writeFileSync('users.json', data)
	}
}





	// static async create(id, name, email) {
	// 	this.id = id
	// 	this.name = name
	// 	this.email = email
	// }

