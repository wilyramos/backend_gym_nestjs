import { IsEmail, IsNumber, IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password?: string;

   
}
