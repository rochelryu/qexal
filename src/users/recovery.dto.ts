
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryDto {
  @IsNotEmpty() @IsEmail() email: string;
}