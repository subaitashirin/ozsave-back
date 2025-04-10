import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/users.model';
import { AUTH_ERROR_CAUSE, AUTH_ERROR_MESSAGES } from '../auth.constant';
import { comparePassword, hashPassword } from 'src/utils/bcrypt.utils';
import { JwtService } from '@nestjs/jwt';
import { IFullUser, IUser } from 'src/modules/users/users.interface';

@Injectable()
export class AuthService {

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly jwtService: JwtService,
	) { }

	async signInOrRegister(email: string, name: string): Promise<{ accessToken: string }> {
		email = email?.toLowerCase();

		let user = await this.userModel.findOne({ email });

		if (!user) {
			user = await this.createUser(email, name);
		}

		const accessToken = this.generateAccessToken(user);
		return { accessToken };
	}

	private async createUser(email: string, name: string) {
		const newUser = await this.userModel.create({
			email,
			name,
			role: 'user', // default role
		});
		return newUser;
	}

	private generateAccessToken(user: Partial<User>): string {
		return this.jwtService.sign({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			imageUrl: user?.imageUrl,
		});
	}
}
