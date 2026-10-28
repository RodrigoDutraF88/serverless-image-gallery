import io
import json
import urllib.parse

import boto3
from PIL import Image

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")

THUMBNAIL_PREFIX = "thumbnails/"
THUMBNAIL_SIZE = (300, 300)
MAX_LABELS = 10
MIN_CONFIDENCE = 80


def handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

        thumbnail_key = make_thumbnail(bucket, key)
        labels = detect_labels(bucket, key)

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