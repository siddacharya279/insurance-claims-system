import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}
  @Get()
  @ApiOperation({ summary: 'Check application health' })
  getHealth() {
    return {
      status: 'ok',
      service: 'insurance-claims-backend',
      timestamp: new Date().toISOString(),
    };
  }
  @Get('ready')
  @ApiOperation({ summary: 'Check application and database readiness' })
  async getReadiness() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
