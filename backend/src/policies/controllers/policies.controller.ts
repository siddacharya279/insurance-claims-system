import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PoliciesService } from '../services/policies.service';
import { CreatePolicyDto } from '../dto/create-policy.dto';
import { UpdatePolicyDto } from '../dto/update-policy.dto';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  create(@Body() dto: CreatePolicyDto, @Request() req: { user: JwtUser }) {
    return this.policiesService.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req: { user: JwtUser }) {
    return this.policiesService.findAll(req.user);
  }

  @Get('my')
  findMyPolicies(@Request() req: { user: JwtUser }) {
    return this.policiesService.findMyPolicies(req.user);
  }

  @Get('customer/:customerId/active')
  findActiveForCustomer(
    @Param('customerId') customerId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.policiesService.findActiveForCustomer(customerId, req.user);
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.policiesService.findById(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.policiesService.update(id, dto, req.user);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.policiesService.cancel(id, req.user);
  }
}
