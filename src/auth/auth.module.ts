import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from 'src/users/users.module';
import {ALL_ENTITY} from 'src/common/constant/constant';

@Module({
	imports: [...ALL_ENTITY,
		UsersModule,
	],
	providers: [ AuthService, UsersService ]
})
export class AuthModule {}
