import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider, User } from './entities/user.entity';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import type { QueryUsersDto } from './dto/get-users-query.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        // Verificar email duplicado
        const existingUser = await this.usersRepository.findOneBy({
            email: createUserDto.email,
        });
        if (existingUser) throw new ConflictException('Email already in use');

        let password: string | null = null;

        if (!createUserDto.provider || createUserDto.provider === AuthProvider.LOCAL) {
            // Usuario LOCAL → requiere password
            if (!createUserDto.password) {
                throw new BadRequestException('La contraseña es requerida');
            }
            password = await bcrypt.hash(createUserDto.password, 10);
        } else if (createUserDto.provider === AuthProvider.GOOGLE) {
            // Usuario Google → guardar googleId y no password
            if (!createUserDto.googleId) {
                throw new BadRequestException('Google ID es requerido');
            }
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            password,
        });

        return this.usersRepository.save(user);
    }


    async findAll(query: QueryUsersDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const qb = this.usersRepository.createQueryBuilder('user')
            .skip(skip)
            .take(limit);

        if (search) {
            qb.where('user.name ILIKE :search OR user.email ILIKE :search', { search: `%${search}%` });
        }

        const [users, total] = await qb.getManyAndCount();

        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
        })

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }


    async findByEmail(email: string, withPassword = false) {
        if (withPassword) {
            return this.usersRepository.findOne({
                where: { email },
                select: ['id', 'email', 'password', 'role'], // incluye password
            });
        }
        return this.usersRepository.findOne({ where: { email } });
    }

    async getUser(id: number) {
        return this.usersRepository.findOne({
            where: { id },
        });
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'], // incluir password
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!user.password) {
            throw new BadRequestException('User does not have a local password set');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        return this.usersRepository.save(user);
    }

    async verifyPassword(userId: number, password: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'], // incluir password
        });

        if (!user || !user.password) {
            throw new NotFoundException('User not found or does not have a local password set');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Incorrect password');
        }

        return true;
    }

    async findAllWithLastMembership(query: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const qb = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.memberships', 'membership')
            .orderBy('user.id', 'DESC')
            .take(limit)
            .skip(skip);

        if (search) {
            qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        const [users, total] = await qb.getManyAndCount();

        const data = users.map(user => ({
            ...user,
            memberships: user.memberships
                .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())
                .slice(0, 1),
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

}