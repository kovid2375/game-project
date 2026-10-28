import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class BundleVictimDto {
  @ApiProperty({ example: "Eleanor Vance" })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({ example: "Chief Financial Officer" })
  @IsString()
  @MaxLength(120)
  occupation: string;

  @ApiProperty({ example: "2026-10-20T20:00:00.000Z" })
  @IsString()
  dateOfDeath: string;

  @ApiProperty({ example: "Penthouse 4B, Blackwood Manor" })
  @IsString()
  @MaxLength(250)
  placeOfDeath: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  biography?: string;
}

export class BundlePoliceReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeOfDeathStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeOfDeathEnd?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  causeOfDeath: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  officerNotes: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class BundleClueDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsString()
  @MaxLength(3000)
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class BundleDocumentDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class BundleLocationDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsString()
  @MaxLength(3000)
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  mapX?: number;

  @IsOptional()
  @IsNumber()
  mapY?: number;

  @IsOptional()
  @IsBoolean()
  isInitiallyOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeadEnd?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleClueDto)
  clues?: BundleClueDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleDocumentDto)
  documents?: BundleDocumentDto[];
}

export class BundleThreadResponseDto {
  @IsString()
  @MaxLength(3000)
  responseText: string;

  @IsOptional()
  @IsBoolean()
  isNervous?: boolean;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class BundleThreadDto {
  @IsString()
  @MaxLength(300)
  topic: string;

  @IsString()
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsInt()
  visitNumber?: number;

  @IsOptional()
  @IsBoolean()
  isInitiallyAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleThreadResponseDto)
  responses?: BundleThreadResponseDto[];
}

export class BundleSuspectDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  @MaxLength(500)
  relationship: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsString()
  @MaxLength(1000)
  claimedAlibi: string;

  @IsOptional()
  @IsString()
  connections?: string;

  @IsOptional()
  @IsBoolean()
  isInitiallyUnlocked?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleThreadDto)
  threads?: BundleThreadDto[];
}

export class BundleSolutionDto {
  @IsOptional()
  @IsString()
  correctSuspectId?: string;

  @IsOptional()
  @IsInt()
  correctSuspectIndex?: number;

  @IsString()
  @MaxLength(2000)
  motive: string;

  @IsString()
  @MaxLength(2000)
  method: string;

  @IsString()
  @MaxLength(5000)
  explanation: string;

  @IsString()
  @MaxLength(5000)
  epilogue: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  motiveKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  methodKeywords?: string[];
}

export class CreateCaseBundleDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  caseNumber: number;

  @ApiProperty({ example: "The Mystery of Room 404" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: "A thrilling mystery case." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: "https://res.cloudinary.com/..." })
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(2048)
  coverImageUrl: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceInRupees: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => BundleVictimDto)
  victim?: BundleVictimDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BundlePoliceReportDto)
  policeReport?: BundlePoliceReportDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleLocationDto)
  locations?: BundleLocationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleSuspectDto)
  suspects?: BundleSuspectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BundleSolutionDto)
  solution?: BundleSolutionDto;
}
