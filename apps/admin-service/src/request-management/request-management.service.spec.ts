import { Test, TestingModule } from '@nestjs/testing';
import { RequestManagementService } from './request-management.service';

describe('RequestManagementService', () => {
  let service: RequestManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestManagementService],
    }).compile();

    service = module.get<RequestManagementService>(RequestManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
