import { Test, TestingModule } from '@nestjs/testing';
import { RequestsServiceController } from './requests-service.controller';
import { RequestsServiceService } from './requests-service.service';

describe('RequestsServiceController', () => {
  let requestsServiceController: RequestsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RequestsServiceController],
      providers: [RequestsServiceService],
    }).compile();

    requestsServiceController = app.get<RequestsServiceController>(RequestsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(requestsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
