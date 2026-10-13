import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";








export class LoginDto{
    @ApiProperty({
        example:'detective@example.com'
    })
    @IsEmail()
    email:string

    @ApiProperty({
        example:'SecurePass123!',
        minLength:12,
        maxLength:128,
        format:'password'
    })
    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password:string

    

    
    
}