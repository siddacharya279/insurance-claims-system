import { Injectable } from '@nestjs/common';
import { ReportingRepository } from '../repositories/reporting.repository';

@Injectable()
export class ReportingService {
  constructor(private readonly reportingRepository: ReportingRepository) {}

  async getClaimStatusSummary() {
    return this.reportingRepository.getClaimStatusSummary();
  }

  async getClaimVolumeByDate(startDate?: Date, endDate?: Date) {
    return this.reportingRepository.getClaimVolumeByDate(startDate, endDate);
  }

  async getAdjudicationSummary() {
    return this.reportingRepository.getAdjudicationSummary();
  }

  async getRepairPaymentSummary() {
    return this.reportingRepository.getRepairPaymentSummary();
  }

  async getAverageProcessingTime() {
    return this.reportingRepository.getAverageProcessingTime();
  }
}
