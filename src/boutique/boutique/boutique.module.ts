import { Module } from '@nestjs/common';
import { BoutiqueController } from './boutique.controller';

@Module({
  controllers: [BoutiqueController],
})
export class BoutiqueModule {}
