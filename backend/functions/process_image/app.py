import io
import json
import os
import urllib.parse
from datetime import datetime, timezone

import boto3
from PIL import Image

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])

THUMBNAIL_PREFIX = "thumbnails/"
THUMBNAIL_SIZE = (300, 300)
MAX_LABELS = 10
MIN_CONFIDENCE = 80
OWNER = "anonymous"  # replaced by the Cognito user id in Phase 7


def handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

        thumbnail_key = make_thumbnail(bucket, key)
        labels = detect_labels(bucket, key)
        save_metadata(key, thumbnail_key, labels)

        print(json.dumps({"key": key, "thumbnail": thumbnail_key, "labels": labels}))


def make_thumbnail(bucket, key):
    with s3.get_object(Bucket=bucket, Key=key)["Body"] as body:
        image = Image.open(io.BytesIO(body.read()))
    image.thumbnail(THUMBNAIL_SIZE)

    buffer = io.BytesIO()
    image.convert("RGB").save(buffer, "JPEG")
    buffer.seek(0)

    thumbnail_key = THUMBNAIL_PREFIX + key.split("/")[-1]
    s3.put_object(Bucket=bucket, Key=thumbnail_key, Body=buffer, ContentType="image/jpeg")
    return thumbnail_key


def detect_labels(bucket, key):
    response = rekognition.detect_labels(
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MaxLabels=MAX_LABELS,
        MinConfidence=MIN_CONFIDENCE,
    )
    return [label["Name"] for label in response["Labels"]]


def save_metadata(key, thumbnail_key, labels):
    image_id = key.split("/")[-1].rsplit(".", 1)[0]
    tags = sorted({label.lower() for label in labels})
    image_sk = f"IMAGE#{image_id}"

    with table.batch_writer() as batch:
        batch.put_item(Item={
            "pk": f"USER#{OWNER}",
            "sk": image_sk,
            "image_id": image_id,
            "key": key,
            "thumbnail_key": thumbnail_key,
            "tags": tags,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        for tag in tags:
            batch.put_item(Item={
                "pk": f"USER#{OWNER}#TAG#{tag}",
                "sk": image_sk,
                "image_id": image_id,
                "thumbnail_key": thumbnail_key,
            })