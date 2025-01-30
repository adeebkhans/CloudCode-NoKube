import {
    S3Client,
    ListObjectsV2Command,
    CopyObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

// Initialize the S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION, // AWS region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    // endpoint: process.env.S3_ENDPOINT || undefined, // Optional: for custom S3 providers
});


/**
 * Copy all objects from one S3 folder to another.
 * 
 * @param sourcePrefix - The source folder prefix.
 * @param destinationPrefix - The destination folder prefix.
 * @param continuationToken - Optional token for paginated results.
 */
export async function copyS3Folder(sourcePrefix: string, destinationPrefix: string, continuationToken?: string): Promise<void> {
    try {
        // List objects in the source folder
        const listParams = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken,
        };

        const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log("No objects found to copy.");
            return;
        }

        // Copy each object to the new location in parallel
        await Promise.all(
            listedObjects.Contents.map(async (object) => {
                // if (!object.Key) return; // use this line or either use this "?" like this - object.Key?

                const destinationKey = object.Key?.replace(sourcePrefix, destinationPrefix);
                const copyParams = {
                    Bucket: process.env.S3_BUCKET ?? "",
                    CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
                    Key: destinationKey,
                };

                await s3.send(new CopyObjectCommand(copyParams));
                console.log(`Copied ${object.Key} to ${destinationKey}`);
            })
        );

        // Handle pagination if more objects exist
        if (listedObjects.IsTruncated) {
            await copyS3Folder(
                sourcePrefix,
                destinationPrefix,
                listedObjects.NextContinuationToken
            );
        }
    } catch (error) {
        console.error("Error copying S3 folder:", error);
        throw error; // Re-throw the error to propagate it to the caller (so on failure it doesnt make a repl)
    }
}

/**
 * Save a file to S3.
 * 
 * @param key - The S3 object key (path).
 * @param filePath - The file path within the folder.
 * @param content - The content to upload.
 */
export const saveToS3 = async (key: string, filePath: string, content: string): Promise<void> => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET ?? "",
            Key: `${key}${filePath}`,
            Body: content,
        };

        console.log(`Uploading to ${params.Key}`);
        await s3.send(new PutObjectCommand(params));
        console.log(`File uploaded successfully to ${params.Key}`);
    } catch (error) {
        console.error("Error uploading file to S3:", error);
    }
};
