import { createHash, randomBytes, timingSafeEqual } from "crypto";






export function generateRefreshToken(){
    const secret=randomBytes(32).toString('base64url')
    return secret;
}
export function hashRefreshToken(token:string){
    return createHash('sha256').update(token).digest('hex')
}
export function safeHashEquals(a:string,b:string){
    const left = Buffer.from(a,'hex')
    const right =Buffer.from(b,'hex')

    return(
        left.length===right.length &&
        left.length>0&&
        timingSafeEqual(left,right)
    )
}