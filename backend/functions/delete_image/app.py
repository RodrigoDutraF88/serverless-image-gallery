import json
import os

import boto3

s3 = boto3.client("s3")
table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
BUCKET_NAME = os.environ["BUCKET_NAME"]
OWNER = "anonymous"  # replaced by the Cognito user id in Phase 7


def handler(event, context):
    image_id = event["pathParameters"]["id"]
    image_sk = f"IMAGE#{image_id}"

    item = table.get_item(Key={"pk": f"USER#{OWNER}", "sk": image_sk}).get("Item")
    if item is None:
        return response(404, {"message": "image not found"})

    # files first: if the table delete fails, calling again still works
    s3.delete_object(Bucket=BUCKET_NAME, Key=item["key"])
    s3.delete_object(Bucket=BUCKET_NAME, Key=item["thumbnail_key"])

    with table.batch_writer() as batch:
        for tag in item.get("tags", []):
            batch.delete_item(Key={"pk": f"USER#{OWNER}#TAG#{tag}", "sk": image_sk})
        batch.delete_item(Key={"pk": f"USER#{OWNER}", "sk": image_sk})

    return response(200, {"deleted": image_id})


def response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }