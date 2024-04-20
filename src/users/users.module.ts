import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ALL_ENTITY } from 'src/common/constant/constant';

@Module({
  imports: ALL_ENTITY,
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
