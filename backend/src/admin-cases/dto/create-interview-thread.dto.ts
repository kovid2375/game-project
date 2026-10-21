import { ApiProperty ,ApiPropertyOptional} from "@nestjs/swagger";
import { IsBoolean, IsInt, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateInterviewThreadDto{
    @ApiProperty({
        example:"Alibi",
        description:"Topic of the interview Question"
    })
    @IsString()
    @MaxLength(300)
    topic:string

    @ApiProperty({
        example:"Where you between 9PM and 11PM ??",
        description:"Question shown to the player"
    })
    @IsString()
    @MaxLength(500)
    question:string

    @ApiProperty({
        example:1,
        description:"which interview visit makes this thread available",
        minimum:1,
        maximum:100,
        default:1
    })
    @IsInt()
    @Min(1)
    @Max(100)
    visitNumber:number=1

    @ApiProperty({
        example:false,
        description:"whether this is available form the beginning",
        default:false
    })
    @IsBoolean()
    isInitiallyAvailable:boolean=false

    @ApiPropertyOptional({
    example: 1,
    description: 'Display order in the interview',
    minimum: 0,
    maximum: 1000,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder: number = 0;
}

