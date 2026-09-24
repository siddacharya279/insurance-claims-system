import { PartialType } from '@nestjs/swagger';
import { CreateCoverageDto } from './create-coverage.dto';

export class UpdateCoverageDto extends PartialType(CreateCoverageDto) {}
