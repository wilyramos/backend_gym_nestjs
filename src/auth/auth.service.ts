import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Validar credenciales (login)
    async validateUser(email: string, password: string) {
        
        try {
            const user = await this.usersService.findByEmail(email, true);
        if (!user || !user.password) {
            // Usuario no encontrado o sin contraseña (Google login)
            throw new UnauthorizedException('Invalid credentialss');
        }

        console.log('Password input:', password);
        console.log('Stored hash:', user.password);


        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials2');
        }

        // devolver user sin password
        const { password: _, ...result } = user;
        return result;
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    // Generar JWT
    async login(user: any) {
        const payload = { sub: user.id, role: user.role, email: user.email };
        const { password, ...userWithoutPassword } = user;
        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };

    }

    // Registrar usuario
    async register(registerDto: RegisterDto) {
        // Verificar si ya existe el email
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        // Hashear password
        const hashed = await bcrypt.hash(registerDto.password.trim(), 10);

        // Crear usuario
        const newUser = await this.usersService.create({
            ...registerDto,
            password: hashed,
        });

        // Opcional → loguear inmediatamente
        return this.login(newUser);
    }
}