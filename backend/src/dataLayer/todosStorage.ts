import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosStorage {

  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getAttachmentUrl(imageId: string): Promise<string> {
    return `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
  }

  async getUploadUrl(imageId: string): Promise<string> {
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: Number(this.urlExpiration) // Must be number
    })
    return uploadUrl
  }
}