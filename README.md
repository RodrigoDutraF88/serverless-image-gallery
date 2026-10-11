# serverless-image-gallery

Serverless image upload and AI auto-tagging app on AWS.

> Work in progress. Built phase by phase while studying for the AWS Certified Cloud Practitioner (CLF-C02).

## How it works

1. User signs in with **Cognito**.
2. Frontend asks **API Gateway + Lambda** for a presigned URL and uploads the image directly to **S3**.
3. The S3 upload event triggers a **Lambda** that creates a thumbnail and calls **Rekognition** for labels.
4. Metadata and tags are saved to **DynamoDB**.
5. The gallery lists and searches images by tag through **API Gateway**, served via **CloudFront** (OAC).

## Stack

S3 · Lambda (Python) · API Gateway · DynamoDB · Rekognition · Cognito · CloudFront · CloudWatch · SNS · IAM · Terraform · GitHub Actions (OIDC) · React + Vite + Tailwind

## Repository layout

```
backend/functions/   one folder per Lambda function
backend/shared/      code shared between functions
backend/tests/       unit tests
frontend/            React + Vite + Tailwind app
infra/modules/       Terraform modules (storage, compute, api, auth, database, cdn, monitoring)
infra/environments/  per-environment Terraform roots (dev)
docs/                architecture, ADRs, exam notes
.github/workflows/   CI/CD pipelines
```

## Docs

- [Exam notes](docs/exam-notes.md): CLF-C02 revision sheet built alongside the project
- [Architecture decisions](docs/adr/)

## License

[MIT](LICENSE)
