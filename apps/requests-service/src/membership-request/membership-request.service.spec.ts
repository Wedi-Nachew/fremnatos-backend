import { Test, TestingModule } from '@nestjs/testing';
import { MembershipRequestService } from './membership-request.service';

describe('MembershipRequestService', () => {
  let service: MembershipRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipRequestService],
    }).compile();

    service = module.get<MembershipRequestService>(MembershipRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
