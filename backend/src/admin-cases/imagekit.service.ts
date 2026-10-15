import { Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import ImageKit,{toFile} from '@imagekit/nodejs';
import "multer";

@Injectable()
export class ImageKitService{
    private readonly client:ImageKit;
    constructor(config:ConfigService){
        const privateKey=config.get<string>('IMAGEKIT_PRIVATE_KEY')
        if(!privateKey){
            throw new Error("IMAGEKIT_PRIVATE_KEY is not congigured")
        }
        this.client=new ImageKit({privateKey})
    }
    async uploadCaseCover(file:Express.Multer.File){
        try {
            const extensionByMime:Record<string,string>={
                "image/jpeg":"jpg",
                "image/png":"png",
                "image/webp":"webp"
            }
            const extension= extensionByMime[file.mimetype]
            if(!extension){
                throw new Error("Invalid File Type")
            }
            const uploaded = await this.client.files.upload({
                file:await toFile(
                    file.buffer,
                    `case-cover.${extension}`
                ),
                fileName:`case-${randomUUID()}.${extension}`,
                folder:'/casefile/covers',
                useUniqueFileName:true
            })
            return {
                url:uploaded.url,
                fileId:uploaded.fileId,
                name:uploaded.name
            }
        } catch (error) {
            if(error instanceof InternalServerErrorException){
                throw error
            }
            throw new ServiceUnavailableException('image upload failded. Please try again later')
        }
    }
}