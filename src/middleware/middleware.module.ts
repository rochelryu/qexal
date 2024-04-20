import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { VerifyOutDelay } from './VerifyOutDelay.middleware';
import { UsersService } from 'src/users/users.service';

import { ALL_ENTITY } from 'src/common/constant/constant';

@Module({
  imports: ALL_ENTITY,
  providers: [UsersService],
})
export class MiddlewareModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyOutDelay).forRoutes(
      // For Categorie
      { path: 'users/', method: RequestMethod.GET },
      { path: 'users/matrix', method: RequestMethod.GET },
      { path: 'users/faq', method: RequestMethod.GET },
      { path: 'users/reclamations', method: RequestMethod.GET },
      { path: 'users/createDemande', method: RequestMethod.GET },
      { path: 'users/confirmation', method: RequestMethod.GET },
      { path: 'users/suivie', method: RequestMethod.GET },
      { path: 'users/view', method: RequestMethod.GET },
    );
  }
}
