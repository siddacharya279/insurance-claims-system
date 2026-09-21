import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        roleId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, phone, roleId, workshopId } =
      createUserDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const role = await this.prismaService.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'WORKSHOP') {
      if (!workshopId) {
        throw new BadRequestException(
          'workshopId is required for WORKSHOP users',
        );
      }

      const workshop = await this.prismaService.workshop.findUnique({
        where: {
          id: workshopId,
        },
      });

      if (!workshop) {
        throw new NotFoundException('Workshop not found');
      }

      if (!workshop.isActive) {
        throw new BadRequestException('Workshop is not active');
      }
    } else if (workshopId) {
      throw new BadRequestException(
        'workshopId can only be provided for WORKSHOP users',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        roleId,
        workshopId: role.name === 'WORKSHOP' ? workshopId : null,
      },
      include: {
        role: true,
        workshop: true,
      },
    });

    const { password: _, ...result } = user;

    return result;
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });
  }
}
