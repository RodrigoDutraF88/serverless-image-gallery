import json
import os

import boto3
from boto3.dynamodb.conditions import Key

s3 = boto3.client("s3")
table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
BUCKET_NAME = os.environ["BUCKET_NAME"]
URL_EXPIRES_SECONDS = 3600


def handler(event, context):
    owner = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    result = table.query(KeyConditionExpression=Key("pk").eq(f"USER#{owner}"))

    images = [
        {
            "image_id": item["image_id"],
            "tags": item.get("tags", []),
            "created_at": item.get("created_at"),
            "thumbnail_url": thumbnail_url(item["thumbnail_key"]),
        }
        for item in result["Items"]
    ]
    return response(200, {"images": images})


def thumbnail_url(key):
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": key},
        ExpiresIn=URL_EXPIRES_SECONDS,
    )


def response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }