import {readFile, readFileSync, writeFileSync} from "fs";
import { Singleton } from 'typescript-ioc';
import { UserEntity } from '../models/user.entity'


@Singleton
export class FileService {

	private path = 'users.json';

	public get(): UserEntity[] {
		return JSON.parse(readFileSync(this.path, 'utf-8'));
	}

	public set(users: UserEntity[]): void {
		writeFileSync(this.path, JSON.stringify(users))
	}


}