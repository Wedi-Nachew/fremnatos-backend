import { Test, TestingModule } from '@nestjs/testing';
import { ContentModerationController } from './content-moderation.controller';

describe('ContentModerationController', () => {
  let controller: ContentModerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentModerationController],
    }).compile();

    controller = module.get<ContentModerationController>(ContentModerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
