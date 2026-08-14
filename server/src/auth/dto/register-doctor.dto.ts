import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDoctorDto {
  @IsNotEmpty({ message: 'שם מלא הוא שדה חובה' })
  @IsString()
  fullName: string;

  @IsEmail({}, { message: 'כתובת האימייל אינה תקינה' })
  email: string;

  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  @Matches(/[A-Z]/, { message: 'הסיסמה חייבת להכיל לפחות אות גדולה אחת' })
  @Matches(/[0-9]/, { message: 'הסיסמה חייבת להכיל לפחות ספרה אחת' })
  password: string;

  @IsNotEmpty({ message: 'מספר רישיון הוא שדה חובה' })
  @IsString()
  licenseNumber: string;

  @IsNotEmpty({ message: 'התמחות היא שדה חובה' })
  @IsString()
  specialization: string;

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
  clinicName?: string;

  @IsOptional()
  @IsUUID('4', { message: 'מזהה מרפאה לא תקין' })
  clinicId?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
