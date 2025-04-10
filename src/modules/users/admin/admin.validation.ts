import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsLowercase, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import mongoose, { mongo } from "mongoose";

export class InviteUserDto {
    @ApiProperty({ example: '67f7cfeec4748c8e9f14471a', required: true })
    @IsString({ message: 'User id must be a string' })
    @IsNotEmpty({ message: 'User id is required' })
    @MinLength(24, { message: 'User id must be at least 24 characters long' })
    @MaxLength(24, { message: 'User id must be at most 24 characters long' })
    userId: string;
}