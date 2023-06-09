import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';

import { MiddlewareModule } from './middleware/middleware.module';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { BoutiqueModule } from './boutique/boutique/boutique.module';
import {ALL_ENTITY} from 'src/common/constant/constant';
import { GatewayModule } from './gateway/gateway/gateway.module';

import 'dotenv/config';
@Module({
	imports: [MulterModule.register({
    dest: join(__dirname, '..', 'public', 'adminMeAndYou', 'images'),
  }),
		TypeOrmModule.forRoot({
			name: 'default',
			type: 'mysql',
			host: process.env.DATABASE_HOST,
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_DB,
			synchronize: true,
			dropSchema: false,
			logging: true,
			entities: ['dist/**/*.entity.js'],
		}),
		...ALL_ENTITY,

		
		AuthModule,
		MiddlewareModule,
		UsersModule,
		BoutiqueModule,
		GatewayModule,
		
	],
	controllers: [ AppController ],
	providers: [ AppService, UsersService ]
})
export class AppModule {}
