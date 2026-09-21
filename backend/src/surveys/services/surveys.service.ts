import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SurveysRepository } from '../repositories/surveys.repository';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { RoleName } from 'src/common/enums/roles.enum';
import { UsersService } from 'src/users/services/users.service';
import { ClaimStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { AuditService } from 'src/audit/services/audit.service';

@Injectable()
export class SurveysService {
  constructor(
    private readonly surveysRepository: SurveysRepository,
    private readonly claimsRepository: ClaimsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async create(createSurveyDto: CreateSurveyDto) {
    const claim = await this.claimsRepository.findById(createSurveyDto.claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (
      claim.status !== ClaimStatus.CASE_ASSIGNED &&
      claim.status !== ClaimStatus.SURVEY_PENDING
    ) {
      throw new BadRequestException('Claim is not ready for survey');
    }

    const surveyor = await this.usersService.findById(
      createSurveyDto.surveyorId,
    );

    if (!surveyor) {
      throw new NotFoundException('Surveyor not found');
    }

    if (surveyor.role.name !== RoleName.SURVEYOR) {
      throw new BadRequestException('Selected user is not a surveyor');
    }

    const existing = await this.surveysRepository.findByClaimId(claim.id);

    if (existing) {
      throw new BadRequestException('Survey already exists for this claim');
    }

    const survey = await this.surveysRepository.create({
      claimId: claim.id,
      surveyorId: surveyor.id,
      damageDescription: createSurveyDto.damageDescription,
      estimatedCost: createSurveyDto.estimatedCost,
    });

    await this.claimsRepository.updateClaimStatus(
      claim.id,
      ClaimStatus.SURVEY_PENDING,
    );

    return survey;
  }

  async complete(id: string, user: JwtUser) {
    const survey = await this.surveysRepository.findById(id);

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const claim = await this.claimsRepository.findById(survey.claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.SURVEY_PENDING) {
      throw new BadRequestException('Claim is not pending survey completion');
    }

    await this.surveysRepository.updateStatus(id, 'COMPLETED');

    await this.claimsRepository.updateClaimStatus(
      claim.id,
      ClaimStatus.SURVEY_COMPLETED,
    );

    await this.auditService.record({
      claimId: claim.id,
      actorUserId: user.id,
      action: 'SURVEY_COMPLETED',
      description: `Survey for claim ${claim.claimNumber} has been completed`,
    });

    await this.notificationsService.create(
      claim.id,
      claim.customerId,
      NotificationType.SURVEY_COMPLETED,
      `Survey for claim ${claim.claimNumber} has been completed.`,
    );

    return this.surveysRepository.findById(id);
  }

  async findById(id: string) {
    const survey = await this.surveysRepository.findById(id);

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async findByClaimId(claimId: string) {
    const survey = await this.surveysRepository.findByClaimId(claimId);

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }
}
