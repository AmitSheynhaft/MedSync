import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentType } from '../../common/constants/domain-enums';

export class UploadDocumentDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  patientUserId?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;
}
