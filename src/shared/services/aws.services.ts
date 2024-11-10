import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  S3Client,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  constructor(private configService: ConfigService) {}

  AWS_S3_BUCKET = this.configService.get('s3BucketUrl');

  public s3Client = new S3Client({
    endpoint: this.configService.get('s3.endpoint'),
    forcePathStyle: false,
    region: this.configService.get('s3.region'),
    credentials: {
      accessKeyId: this.configService.get('s3.apiKey'),
      secretAccessKey: this.configService.get('s3.secretKey'),
    },
  });

  async uploadFile(key: string, file: any, type = 'image/jpeg') {
    const params: PutObjectCommandInput = {
      Bucket: this.configService.get('s3.bucket'),
      Key: key,
      Body: file,
      ACL: 'public-read',
      Metadata: {
        'Content-Type': type,
      },
    };

    try {
      const s3Response = await this.s3Client.send(new PutObjectCommand(params));
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteFile(key: string) {
    const params: DeleteObjectCommandInput = {
      Bucket: this.configService.get('s3.bucket'),
      Key: key,
    };

    try {
      const s3Response = await this.s3Client.send(
        new DeleteObjectCommand(params),
      );
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
}
