import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentsRepository } from '../repositories/documents.repository';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { RoleName } from 'src/common/enums/roles.enum';
import * as fs from 'fs/promises';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly claimsRepository: ClaimsRepository,
  ) {}

  private authorizeDocumentAccess(claim: any, user: JwtUser) {
    if (
      user.role === RoleName.ADMIN ||
      user.role === RoleName.CASE_MANAGER ||
      user.role === RoleName.ADJUSTER ||
      user.role === RoleName.SURVEYOR ||
      user.role === RoleName.AUDITOR ||
      user.role === RoleName.WORKSHOP
    ) {
      return;
    }

    if (user.role === RoleName.CUSTOMER && claim.customerId === user.id) {
      return;
    }

    throw new ForbiddenException(
      'Not allowed to access documents for this claim',
    );
  }

  async upload(claimId: string, file: Express.Multer.File, user: JwtUser) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const claim = await this.claimsRepository.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.authorizeDocumentAccess(claim, user);

    try {
      return await this.documentsRepository.create({
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        claimId,
      });
    } catch (error) {
      try {
        await fs.unlink(file.path);
      } catch {}

      throw error;
    }
  }

  async fetchAllByClaimId(claimId: string, user: JwtUser) {
    const claim = await this.claimsRepository.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.authorizeDocumentAccess(claim, user);

    return this.documentsRepository.fetchAllByClaimId(claimId);
  }

  async findById(id: string, user: JwtUser) {
    const document = await this.documentsRepository.findById(id);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const claim = await this.claimsRepository.findById(document.claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.authorizeDocumentAccess(claim, user);

    return document;
  }

  async deleteById(id: string, user: JwtUser) {
    const document = await this.documentsRepository.findById(id);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const claim = await this.claimsRepository.findById(document.claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.authorizeDocumentAccess(claim, user);

    try {
      await fs.unlink(document.filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    return this.documentsRepository.deleteById(id);
  }
}
