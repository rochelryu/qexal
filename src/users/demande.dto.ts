
import { IsEmail, IsAlphanumeric, IsNotEmpty } from 'class-validator';

export class createDemandeDto {
  @IsNotEmpty() @IsAlphanumeric() forfaitId: number;
  txHash: string;
  @IsNotEmpty() amount: number;
}