
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertCaseVictimDto {
  @ApiProperty({example:"jhon"})
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({example:"23"})
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({example:"Developer"})
  @IsString()
  @MaxLength(120)
  occupation: string;
  
  @ApiProperty({example:"20/10/2026"})
  @IsDateString()
  dateOfDeath: string;

  @ApiProperty({example:"Home"})
  @IsString()
  @MaxLength(250)
  placeOfDeath: string;
  
  @ApiProperty({example:""})
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  biography?: string;
}
