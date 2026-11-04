# here i need to write the function to generate a presigned URL for uploading files to S3.
import json
import os
import uuid

import boto3

s3 = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]
URL_EXPIRES_SECONDS = 300


def handler(event, context):
    owner = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    key = f"uploads/{owner}/{uuid.uuid4()}.jpg"

    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": BUCKET_NAME, "Key": key, "ContentType": "image/jpeg"},
        ExpiresIn=URL_EXPIRES_SECONDS,
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"upload_url": upload_url, "key": key}),
    }