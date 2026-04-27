import { Test, TestingModule } from '@nestjs/testing';
import { FundraiseController } from './fundraise.controller';

describe('FundraiseController', () => {
  let controller: FundraiseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundraiseController],
    }).compile();

    controller = module.get<FundraiseController>(FundraiseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
