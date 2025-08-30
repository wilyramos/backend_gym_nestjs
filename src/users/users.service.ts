import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

}
