import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RoleName } from 'src/common/enums/roles.enum';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all registered users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
