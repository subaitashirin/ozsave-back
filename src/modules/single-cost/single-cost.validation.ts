import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
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

class SingleCostItemDto {
    @ApiProperty({ example: 'Milk' })
    @IsString({ message: 'Item name must be a string' })
    @IsNotEmpty({ message: 'Item name is required' })
    name: string;
  
    @ApiProperty({ example: 2.5 })
    @IsNumber({}, { message: 'Item price must be a number' })
    @IsNotEmpty({ message: 'Item price is required' })
    price: number;
  
    @ApiProperty({ example: 2 })
    @IsNumber({}, { message: 'Item quantity must be a number' })
    @IsNotEmpty({ message: 'Item quantity is required' })
    quantity: number;
  
    @ApiProperty({ example: 5.0 })
    @IsNumber({}, { message: 'Item cost must be a number' })
    @IsNotEmpty({ message: 'Item cost is required' })
    cost: number;
  }

export class AddSingleCostDto {
    @ApiProperty({ example: 'Coles' })
    @IsString({ message: 'Store name must be a string' })
    @IsNotEmpty({ message: 'Store name is required' })
    @MinLength(3, { message: 'Store name must be at least 3 characters long' })
    @MaxLength(20, { message: 'Store name must be at most 20 characters long' })
    storeName: string;

    @ApiProperty({ example: '2025-04-10T14:00:00Z', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'Date must be a valid ISO string' })
    date?: string;

    @ApiProperty({ type: [SingleCostItemDto] })
    @IsArray({ message: 'Items must be an array' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    @ValidateNested({ each: true })
    @Type(() => SingleCostItemDto)
    items: SingleCostItemDto[];

    @ApiProperty({ type: [FileDto], required: false })
    @IsOptional()
    @IsArray({ message: 'Files must be an array' })
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    files?: FileDto[];

    @ApiProperty({ example: 'Weekly grocery shopping', required: false })
    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;
}