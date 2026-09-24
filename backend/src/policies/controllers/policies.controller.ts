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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PoliciesService } from '../services/policies.service';
import { CreatePolicyDto } from '../dto/create-policy.dto';
import { UpdatePolicyDto } from '../dto/update-policy.dto';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@ApiTags('Policies')
@ApiBearerAuth()
@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new insurance policy' })
  create(@Body() dto: CreatePolicyDto, @Request() req: { user: JwtUser }) {
    return this.policiesService.create(dto, req.user);
  }
  @Get()
  @ApiOperation({
    summary: 'Get policies accessible to the authenticated user',
  })
  findAll(@Request() req: { user: JwtUser }) {
    return this.policiesService.findAll(req.user);
  }
  @Get('my')
  @ApiOperation({
    summary: 'Get policies belonging to the authenticated customer',
  })
  findMyPolicies(@Request() req: { user: JwtUser }) {
    return this.policiesService.findMyPolicies(req.user);
  }
  @Get('customer/:customerId/active')
  @ApiOperation({ summary: 'Get active policies for a customer' })
  findActiveForCustomer(
    @Param('customerId') customerId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.policiesService.findActiveForCustomer(customerId, req.user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a policy by ID' })
  findById(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.policiesService.findById(id, req.user);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a policy' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.policiesService.update(id, dto, req.user);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a policy' })
  cancel(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.policiesService.cancel(id, req.user);
  }
}
