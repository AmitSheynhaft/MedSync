import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterPatientDto {
  @IsNotEmpty({ message: 'שם מלא הוא שדה חובה' })
  @IsString()
  fullName: string;

  @IsEmail({}, { message: 'כתובת האימייל אינה תקינה' })
  email: string;

  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  @Matches(/[A-Z]/, { message: 'הסיסמה חייבת להכיל לפחות אות גדולה אחת' })
  @Matches(/[0-9]/, { message: 'הסיסמה חייבת להכיל לפחות ספרה אחת' })
  password: string;

  @IsOptional()
  @Matches(/^\d{9}$/, { message: 'תעודת הזהות חייבת להכיל 9 ספרות' })
  idNumber?: string;

  @IsOptional()
  @Matches(/^0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/, {
    message: 'מספר הטלפון אינו תקין (לדוגמה: 050-1234567)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  hmo?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsNotEmpty({ message: 'יש לבחור מרפאה' })
  @IsUUID('4', { message: 'מזהה מרפאה לא תקין' })
  clinicId: string;

  @IsOptional()
  @IsString()
  role?: string;
}
