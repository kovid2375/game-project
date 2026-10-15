import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class CreateCaseDto{
    @ApiProperty({example: 1})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    caseNumber:number;
    
    @ApiProperty({example:"The Mystery of Room 404"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    title:string;

    @ApiProperty({example:"A thrilling mystery case."})
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description:string;

    @ApiProperty({example:"https://ik.imagekit.io/..."})
    @IsUrl({protocols:['https'],require_protocol:true})
    @MaxLength(2048)
    coverImageUrl:string;

    @ApiProperty({example: 100})
    @Type(() => Number)
    @IsInt()
    @Min(0)
    priceInRupees:number;
}