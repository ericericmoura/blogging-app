import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3 = new S3Client(env.NODE_ENV === "development"
    ? { 
        region: "us-east-1",
        credentials: {
            accessKeyId: "test",
            secretAccessKey: "test"
        },
        forcePathStyle: true,
        endpoint: "http://localstack:4566"
    }
    : {
        region: env.BUCKET_REGION,
        credentials: {
            accessKeyId: env.ACCESS_KEY_ID,
            secretAccessKey: env.SECRET_ACCESS_KEY
        },
    }
);