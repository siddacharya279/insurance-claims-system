import {
  Controller,
  Param,
  Post,
  UploadedFile,
  Request,
  Response,
  UseInterceptors,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiBearerAuth()
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
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(null, uniqueName + extname(file.originalname).toLowerCase());
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
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
  @UseGuards(JwtAuthGuard)
  @Post('upload/:claimId')
  upload(
    @Param('claimId') claimId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.documentsService.upload(claimId, file, req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all documents for a specific claim' })
  @UseGuards(JwtAuthGuard)
  @Get('claim/:claimId')
  async fetchAllByClaimId(
    @Param('claimId') claimId: string,
    @Request() req: any,
  ) {
    return this.documentsService.fetchAllByClaimId(claimId, req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch a specific document by ID' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req: any,
    @Response() res: any,
  ) {
    const document = await this.documentsService.findById(id, req.user);
    return res.sendFile(document.fileName, { root: './uploads' });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific document by ID' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteById(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.deleteById(id, req.user);
  }
}
