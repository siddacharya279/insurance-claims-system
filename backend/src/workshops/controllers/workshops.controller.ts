import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RoleName } from 'src/common/enums/roles.enum';
import { CreateWorkshopDto } from '../dto/create-workshop.dto';
import { UpdateWorkshopDto } from '../dto/update-workshop.dto';
import { WorkshopsService } from '../services/workshops.service';

@ApiTags('Workshops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}
  @ApiOperation({ summary: 'Create a new workshop' })
  @Roles(RoleName.ADMIN)
  @Post()
  async create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsService.createWorkshop(createWorkshopDto);
  }
  @ApiOperation({ summary: 'Fetch all workshops' })
  @Get()
  async findAll() {
    return this.workshopsService.findAllWorkshops();
  }
  @ApiOperation({ summary: 'Fetch a workshop by ID' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workshopsService.findWorkshopById(id);
  }
  @ApiOperation({ summary: 'Update a workshop by ID' })
  @Roles(RoleName.ADMIN)
  @Patch(':id')
  async updateById(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopsService.updateWorkshopById(id, updateWorkshopDto);
  }
  @ApiOperation({ summary: 'Delete a workshop by ID' })
  @Roles(RoleName.ADMIN)
  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.workshopsService.deleteWorkshopById(id);
  }
}
