import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileDto {
    @ApiProperty({ example: 'file_123' })
    @IsString({ message: 'File ID must be a string' })
    @IsNotEmpty({ message: 'File ID is required' })
    id: string;

    @ApiProperty({ example: 'receipt.jpg' })
    @IsString({ message: 'File name must be a string' })
    @IsNotEmpty({ message: 'File name is required' })
    name: string;

    @ApiProperty({ example: 'image/jpeg' })
    @IsString({ message: 'MIME type must be a string' })
    @IsNotEmpty({ message: 'MIME type is required' })
    mimeType: string;

    @ApiProperty({ example: 524288 })
    @IsNumber({}, { message: 'File size must be a number' })
    size: number;
}

class HouseCostItemDto {
    @ApiProperty({ example: 'Milk' })
    @IsString({ message: 'Item name must be a string' })
    @IsNotEmpty({ message: 'Item name is required' })
    name: string;

    @ApiProperty({ example: 2.5 })
    @IsNumber({}, { message: 'Item price must be a number' })
    @Min(0.01, { message: 'Item price must be greater than 0' })
    @IsNotEmpty({ message: 'Item price is required' })
    price: number;

    @ApiProperty({ example: 2 })
    @IsNumber({}, { message: 'Item quantity must be a number' })
    @Min(1, { message: 'Item quantity must be at least 1' })
    @IsNotEmpty({ message: 'Item quantity is required' })
    quantity: number;

    @ApiProperty({
        example: ['661a01f28b4a66c9b3a9f1ef', '661a02108b4a66c9b3a9f1f0'],
        description: 'Users sharing this item',
    })
    @IsArray({ message: 'sharedBy must be an array' })
    @ArrayMinSize(1, { message: 'At least one user must be included in sharedBy' })
    @IsMongoId({ each: true, message: 'Each ID in sharedBy must be a valid Mongo ID' })
    sharedBy: string[];
}

export class AddHouseCostDto {
    @ApiProperty({ example: 'Coles' })
    @IsString({ message: 'Store name must be a string' })
    @IsNotEmpty({ message: 'Store name is required' })
    @MinLength(3, { message: 'Store name must be at least 3 characters long' })
    @MaxLength(20, { message: 'Store name must be at most 20 characters long' })
    storeName: string;

    @ApiProperty({ type: [HouseCostItemDto] })
    @IsArray({ message: 'Items must be an array' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    @ValidateNested({ each: true })
    @Type(() => HouseCostItemDto)
    items: HouseCostItemDto[];

    @ApiProperty({ type: [FileDto], required: false })
    @IsOptional()
    @IsArray({ message: 'Files must be an array' })
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    files?: FileDto[];

    @ApiProperty({ example: 'Shared kitchen essentials', required: false })
    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;
}

// edit house cost iems
export class EditHouseCostDto {
    @ApiProperty({ type: [HouseCostItemDto], required: false })
    @IsNotEmpty()
    @IsArray({ message: 'Items must be an array' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    @ValidateNested({ each: true })
    @Type(() => HouseCostItemDto)
    items: HouseCostItemDto[];
}