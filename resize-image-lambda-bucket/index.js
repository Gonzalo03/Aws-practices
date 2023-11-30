import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import sharp from "sharp"


const s3Client = new S3Client({})

export const handler = async (event) => {

    const Bucket = event.Records[0].s3.bucket.name
    const Key = event.Records[0].s3.object.key

    const s3Object = await s3Client.send(new GetObjectCommand({
        Bucket,
        Key
    }))

    const streamImage = await s3Object.Body.transformToByteArray()

    const resizedStreamImage = await sharp(streamImage).resize(process.env.WIDTH_RESIZE_IMAGE,process.env.HEIGHT_RESIZE_IMAGE).toBuffer()

    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.OUTPUT_BUCKET,
        Key: process.env.OUTPUT_FILE_KEY,
        Body: resizedStreamImage,
        ContentType: await s3Object.ContentType
        }
    ))

    console.log("The file has been uploaded successfully")

    return {
        statusCode: 200,
        mssg: 'Done'
    }
}
