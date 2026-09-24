import { Module } from '@nestjs/common';
import { PoliciesController } from './controllers/policies.controller';
import { PoliciesService } from './services/policies.service';
import { PoliciesRepository } from './repositories/policies.repository';
import { CoverageService } from './services/coverage.service';
import { CoverageRepository } from './repositories/coverage.repository';
import { CoverageController } from './controllers/coverage.controller';

@Module({
  controllers: [PoliciesController, CoverageController],
  providers: [
    PoliciesService,
    PoliciesRepository,
    CoverageService,
    CoverageRepository,
  ],
  exports: [PoliciesService, CoverageService],
})
export class PoliciesModule {}
