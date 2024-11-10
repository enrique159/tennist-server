export default () => ({
  port: parseInt(process.env.PORT) || 3333,
  secretKey: process.env.SECRET_KEY || 'secret',
  s3: {
    url: process.env.S3_BUCKET_URL || 'https://tennist-bucket.s3.amazonaws.com',
    endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
    region: process.env.S3_REGION || 'us-west-1',
    bucket: process.env.S3_BUCKET || 'bucketName',
    apiKey: process.env.S3_API_KEY || 'ApiKey',
    secretKey: process.env.S3_SECRET_KEY || 'SecretKey',
  },
});
