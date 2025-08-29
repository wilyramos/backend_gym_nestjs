import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { PaymentsModule } from './payments/payments.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Make configuration globally available
        }),
        TypeOrmModule.forRootAsync({
            useFactory: typeOrmConfig,
            inject: [ConfigService],
        }), // Asynchronous configuration for TypeORM
        UsersModule,
        PaymentsModule,
        RoutinesModule,
        MembershipsModule,
        AuthModule,
        ExercisesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
