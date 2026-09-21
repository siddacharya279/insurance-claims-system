import {
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
    const { firstName, lastName, email, password, phone, roleId } =
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        roleId,
      },
      include: {
        role: true, //Includes role to response
      },
    });

    const { password: _, ...result } = user; //removing password here from response

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
