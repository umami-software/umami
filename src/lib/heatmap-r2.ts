import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

function getBucket() {
  const bucket = process.env.R2_BUCKET;

  if (!bucket) {
    throw new Error('R2_BUCKET is not set.');
  }

  return bucket;
}

function getAccountId() {
  const accountId = process.env.R2_ACCOUNT_ID;

  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID is not set.');
  }

  return accountId;
}

function getCredentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId) {
    throw new Error('R2_ACCESS_KEY_ID is not set.');
  }

  if (!secretAccessKey) {
    throw new Error('R2_SECRET_ACCESS_KEY is not set.');
  }

  return {
    accessKeyId,
    secretAccessKey,
  };
}

function getClient() {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${getAccountId()}.r2.cloudflarestorage.com`,
      credentials: getCredentials(),
    });
  }

  return client;
}

export async function putHeatmapSnapshot(objectKey: string, imageData: Buffer, mimeType: string) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: objectKey,
      Body: imageData,
      ContentType: mimeType,
    }),
  );
}

export async function getHeatmapSnapshot(objectKey: string) {
  let response;

  try {
    response = await getClient().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: objectKey,
      }),
    );
  } catch (error: any) {
    if (
      error?.name === 'NoSuchKey' ||
      error?.Code === 'NoSuchKey' ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }

    throw error;
  }

  if (!response.Body) {
    return null;
  }

  return {
    mimeType: response.ContentType || 'application/octet-stream',
    imageData: Buffer.from(await response.Body.transformToByteArray()),
  };
}
