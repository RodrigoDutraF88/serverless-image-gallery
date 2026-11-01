import json
import os

import boto3
from boto3.dynamodb.conditions import Key

s3 = boto3.client("s3")
table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
BUCKET_NAME = os.environ["BUCKET_NAME"]
OWNER = "anonymous"  # replaced by the Cognito user id in Phase 7
URL_EXPIRES_SECONDS = 3600


def handler(event, context):
    params = event.get("queryStringParameters") or {}
    tag = params.get("tag", "").strip().lower()
    if not tag:
        return response(400, {"message": "missing ?tag= parameter"})

    result = table.query(KeyConditionExpression=Key("pk").eq(f"USER#{OWNER}#TAG#{tag}"))

    images = [
        {
            "image_id": item["image_id"],
            "thumbnail_url": thumbnail_url(item["thumbnail_key"]),
        }
        for item in result["Items"]
    ]
    return response(200, {"tag": tag, "images": images})


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