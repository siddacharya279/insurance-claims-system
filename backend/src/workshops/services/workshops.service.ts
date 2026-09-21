import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkshopsRepository } from '../repositories/workshops.repository';
import { CreateWorkshopDto } from '../dto/create-workshop.dto';
import { UpdateWorkshopDto } from '../dto/update-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(private readonly workshopsRepository: WorkshopsRepository) {}

  async createWorkshop(createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsRepository.create(createWorkshopDto);
  }

  async findAllWorkshops() {
    return this.workshopsRepository.findAll();
  }

  async findWorkshopById(id: string) {
    const workshop = await this.workshopsRepository.findById(id);

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    return workshop;
  }

  async updateWorkshopById(id: string, updateWorkshopDto: UpdateWorkshopDto) {
    const workshop = await this.workshopsRepository.findById(id);

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    return this.workshopsRepository.updateById(id, updateWorkshopDto);
  }

  async deleteWorkshopById(id: string) {
    const workshop = await this.workshopsRepository.findById(id);

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    await this.workshopsRepository.deleteById(id);

    return {
      message: 'Workshop deleted successfully',
    };
  }
}
