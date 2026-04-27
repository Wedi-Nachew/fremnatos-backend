import { Test, TestingModule } from '@nestjs/testing';
import { PartnershipController } from './partnership.controller';

describe('PartnershipController', () => {
  let controller: PartnershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnershipController],
    }).compile();

    controller = module.get<PartnershipController>(PartnershipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
