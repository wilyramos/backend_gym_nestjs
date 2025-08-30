import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthProvider } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    // Solo requerido si el registro es LOCAL
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsEnum(AuthProvider)
    @IsOptional() // Por defecto será LOCAL si no se envía
    provider?: AuthProvider;

    // Solo requerido si el provider es GOOGLE
    @IsOptional()
    @IsString()
    googleId?: string;
}
