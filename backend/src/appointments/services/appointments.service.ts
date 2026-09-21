import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { WorkshopsRepository } from 'src/workshops/repositories/workshops.repository';
import { RoleName } from 'src/common/enums/roles.enum';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly claimsRepository: ClaimsRepository,
    private readonly workshopsRepository: WorkshopsRepository,
  ) {}

  private async assertClaimAccess(
    claim: {
      customerId: string;
      workshopId: string | null;
    },
    user: JwtUser,
  ): Promise<void> {
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.CASE_MANAGER,
      RoleName.WORKSHOP,
      RoleName.CUSTOMER,
    ];

    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new ForbiddenException(
        'You are not authorized to access appointments',
      );
    }

    if (user.role === RoleName.CUSTOMER && claim.customerId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to access this claim appointment',
      );
    }

    if (user.role === RoleName.WORKSHOP) {
      if (!claim.workshopId) {
        throw new ForbiddenException('No workshop is assigned to this claim');
      }

      const workshopUser = await this.workshopsRepository.findUserById(user.id);

      if (!workshopUser) {
        throw new ForbiddenException('Workshop user not found');
      }

      if (!workshopUser.workshopId) {
        throw new ForbiddenException(
          'Workshop user is not assigned to a workshop',
        );
      }

      if (workshopUser.workshopId !== claim.workshopId) {
        throw new ForbiddenException(
          'You are not authorized to access this workshop appointment',
        );
      }
    }
  }

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    user: JwtUser,
  ) {
    const claim = await this.claimsRepository.findById(
      createAppointmentDto.claimId,
    );

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    await this.assertClaimAccess(claim, user);

    if (!claim.workshopId) {
      throw new BadRequestException('Workshop not assigned to the claim');
    }

    const existing = await this.appointmentsRepository.findByClaimId(
      createAppointmentDto.claimId,
    );

    if (existing) {
      throw new BadRequestException(
        'An appointment already exists for this claim.',
      );
    }

    return this.appointmentsRepository.create({
      claimId: createAppointmentDto.claimId,
      workshopId: claim.workshopId,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
    });
  }

  async findById(id: string, user: JwtUser) {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const claim = await this.claimsRepository.findById(appointment.claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    await this.assertClaimAccess(claim, user);

    return appointment;
  }

  async findByClaimId(claimId: string, user: JwtUser) {
    const claim = await this.claimsRepository.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    await this.assertClaimAccess(claim, user);

    const appointment =
      await this.appointmentsRepository.findByClaimId(claimId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}
