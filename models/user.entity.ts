export class UserEntity {
	id: number;
	name: string;
	password: string;
	email: string;
	token: string | null
	enabled: boolean;
}