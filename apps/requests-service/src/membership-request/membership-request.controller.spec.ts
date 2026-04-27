import { Test, TestingModule } from '@nestjs/testing';
import { MembershipRequestController } from './membership-request.controller';

describe('MembershipRequestController', () => {
  let controller: MembershipRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipRequestController],
    }).compile();

    controller = module.get<MembershipRequestController>(MembershipRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
