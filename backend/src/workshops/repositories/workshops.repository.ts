import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkshopDto } from '../dto/create-workshop.dto';
import { UpdateWorkshopDto } from '../dto/update-workshop.dto';

@Injectable()
export class WorkshopsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateWorkshopDto) {
    return this.prismaService.workshop.create({
      data,
    });
  }

  async findAll() {
    return this.prismaService.workshop.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.workshop.findUnique({
      where: { id },
    });
  }

  async updateById(id: string, data: UpdateWorkshopDto) {
    return this.prismaService.workshop.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: string) {
    return this.prismaService.workshop.delete({
      where: { id },
    });
  }

  async findUserById(userId: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        workshopId: true,
        role: true,
        status: true,
      },
    });
  }
}
