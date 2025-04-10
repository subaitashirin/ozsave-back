import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsLowercase, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class UserLoginDto {
    @ApiProperty({ example: 'fahim@gmail.com', required: true })
    @IsEmail({}, {message: 'Invalid email address'})
	@IsLowercase({message: 'Email must be lowercase'})
    email: string;

    @ApiProperty({ example: 'Fahim', required: true })
    @IsString({ message: 'Name must be a string' })
    name: string;
}