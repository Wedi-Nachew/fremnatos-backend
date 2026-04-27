import { Test, TestingModule } from '@nestjs/testing';
import { FundraiseService } from './fundraise.service';

describe('FundraiseService', () => {
  let service: FundraiseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundraiseService],
    }).compile();

    service = module.get<FundraiseService>(FundraiseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
