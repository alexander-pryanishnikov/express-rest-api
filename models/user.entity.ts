/** TODO: + [VT] 04.08.2021, 17:17: Не увидел нигде применение и проверки на enabled */

export class UserEntity {
	id: number;
	name: string;
	password: string;
	email: string;
	token: string | null
	enabled: boolean;
}
