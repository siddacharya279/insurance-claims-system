import { PartialType } from '@nestjs/swagger';
import { CreateRentalSelectionDto } from './create-rental-selection.dto';

export class UpdateRentalSelectionDto extends PartialType(
  CreateRentalSelectionDto,
) {}
