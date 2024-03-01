import { Test, TestingModule } from '@nestjs/testing';
import { BoutiqueController } from './boutique.controller';

describe('Boutique Controller', () => {
  let controller: BoutiqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoutiqueController],
    }).compile();

    controller = module.get<BoutiqueController>(BoutiqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
