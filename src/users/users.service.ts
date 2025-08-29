import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    findAll() {
        return `This action returns all users`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}