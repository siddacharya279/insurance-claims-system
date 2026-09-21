import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { DocumentsService } from '../services/documents.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiOperation({ summary: 'Upload a document for a specific claim' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(null, uniqueName + extname(file.originalname).toLowerCase());
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new Error('Only PDF, JPEG and PNG files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @Post('upload/:claimId')
  upload(
    @Param('claimId') claimId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: JwtUser },
  ) {
    return this.documentsService.upload(claimId, file, req.user);
  }

  @ApiOperation({ summary: 'Fetch all documents for a specific claim' })
  @Get('claim/:claimId')
  async fetchAllByClaimId(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.documentsService.fetchAllByClaimId(claimId, req.user);
  }

  @ApiOperation({ summary: 'Fetch a specific document by ID' })
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req: { user: JwtUser },
    @Response() res: any,
  ) {
    const document = await this.documentsService.findById(id, req.user);

    return res.sendFile(document.fileName, {
      root: join(process.cwd(), 'uploads'),
    });
  }

  @ApiOperation({ summary: 'Delete a specific document by ID' })
  @Delete(':id')
  async deleteById(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.documentsService.deleteById(id, req.user);
  }
}
