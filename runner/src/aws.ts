import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    CopyObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Initialize the S3Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    endpoint: process.env.S3_ENDPOINT,
});

/**
 * Fetches a folder from S3 and writes its content to the local filesystem.
 * Ensures the local directory structure matches S3.
 */
export const fetchS3Folder = async (key: string, localPath: string): Promise<void> => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: key,
        };

        const { Contents } = await s3.send(new ListObjectsV2Command(params));

        if (Contents) {
            await Promise.all(
                Contents.map(async (file) => {
                    const fileKey = file.Key;

                    // Skip directory placeholders
                    if (fileKey && !fileKey.endsWith("/")) {
                        const filePath = path.join(localPath, fileKey.replace(key, ""));
                        await ensureDirectoryExists(path.dirname(filePath));

                        const getObjectParams = {
                            Bucket: process.env.S3_BUCKET ?? "",
                            Key: fileKey,
                        };

                        const data = await s3.send(new GetObjectCommand(getObjectParams));
                        if (data.Body) {
                            const fileData = await readStreamToBuffer(data.Body as Readable);
                            await writeFile(filePath, fileData);
                            console.log(`Downloaded ${fileKey} to ${filePath}`);
                        }
                    }
                })
            );
        }
    } catch (error) {
        console.error("Error fetching folder:", error);
    }
};

/**
 * Writes data to a file, ensuring parent directories exist.
 */
async function writeFile(filePath: string, fileData: Buffer): Promise<void> {
    await ensureDirectoryExists(path.dirname(filePath));
    await fs.promises.writeFile(filePath, fileData);
}

/**
 * Ensures a directory and its parent directories exist.
 */
async function ensureDirectoryExists(dirName: string): Promise<void> {
    await fs.promises.mkdir(dirName, { recursive: true });
}

/**
 * Converts a readable stream to a buffer.
 */
function readStreamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

/**
 * Saves content to S3.
 */
export const saveToS3 = async (key: string, filePath: string, content: string): Promise<void> => {
    const params = {
        Bucket: process.env.S3_BUCKET ?? "",
        Key: `${key}${filePath}`,
        Body: Buffer.from(content), // Convert string content to Buffer
    };

    await s3.send(new PutObjectCommand(params));
    console.log(`Uploaded ${filePath} to S3 as ${key}${filePath}`);
};
