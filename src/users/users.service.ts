import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
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

        // Check if the user already exists by email
        const existingUser = await this.usersRepository.findOneBy({ email: createUserDto.email });
        if (existingUser) {
            throw new ConflictException(`User with email ${createUserDto.email} already exists`);
        }

        // Has the password before saving

        if (!createUserDto.password) {
            throw new BadRequestException(`Password is required`);
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.save({
            ...createUserDto,
            password: hashedPassword
        });
        return user;
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

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async findByEmail(email: string, withPassword = false) {
        const user = await this.usersRepository.findOne({
            where: { email },
            select: withPassword ? ['id', 'name', 'email', 'password', 'role'] : ['id', 'name', 'email', 'role'],
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }
}