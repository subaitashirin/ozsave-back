import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsLowercase, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import mongoose, { mongo } from "mongoose";

export class AddHouseDto {
    @ApiProperty({ example: 'House 1', required: true })
    @IsString({ message: 'House name must be a string' })
    @IsNotEmpty({ message: 'House name is required' })
    @MinLength(3, { message: 'House name must be at least 3 characters long' })
    @MaxLength(20, { message: 'House name must be at most 20 characters long' })
    name: string;
}