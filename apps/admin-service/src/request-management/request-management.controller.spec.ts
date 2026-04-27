import { Test, TestingModule } from '@nestjs/testing';
import { RequestManagementController } from './request-management.controller';

describe('RequestManagementController', () => {
  let controller: RequestManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestManagementController],
    }).compile();

    controller = module.get<RequestManagementController>(RequestManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
