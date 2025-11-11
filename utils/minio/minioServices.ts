import { BUCKET, minioClient } from "./minioClient"

export const getObject = async(objectName: string) => {
  const publicUrl = await minioClient.presignedGetObject(BUCKET, objectName);

  return publicUrl
}