import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AuthProvider } from 'src/users/entities/user.entity';

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

            console.log('Password input for login:', password, `[${password.length}]`);
            console.log('Hash from DB:', user.password, `[${user.password.length}]`);


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

        const newUser = await this.usersService.create(registerDto);
        // Opcional → loguear inmediatamente
        return this.login(newUser);
    }

    async googleLogin(email: string, googleId: string, name: string) {
        let user = await this.usersService.findByEmail(email, true);

        if (!user) {
            // Usuario nuevo → crear GOOGLE
            user = await this.usersService.create({
                name,
                email,
                googleId,
                provider: AuthProvider.GOOGLE,
            });
        } else if (!user.googleId) {
            // Usuario existente LOCAL → vincular Google
            user.googleId = googleId;
            await this.usersService.update(user.id, { googleId });
        }

        // Generar JWT
        return this.login(user);
    }

    async checkEmail(email: string) {
        const user = await this.usersService.findByEmail(email);
        return { exists: !!user };
    }
}   