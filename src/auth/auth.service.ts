import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Validar credenciales (login)
    async validateUser(email: string, password: string) {
        try {
            // select password
            const user = await this.usersService.findByEmail(email, true);
            if (!user) throw new UnauthorizedException('Invalid credentials');

            // compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new UnauthorizedException('Invalid credentials');

            // return user without password
            const { password: _, ...result } = user;
            return result;
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    // Generate JWT token
    async login(user: any) { // Esta en any dado que el user viene sin password
        const payload = { sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    // Register
}