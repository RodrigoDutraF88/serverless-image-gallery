# Roadmap

- [x] **0. Account setup:** root MFA, budget guard, IAM user, AWS CLI, Terraform
- [ ] **1. Storage:** private S3 bucket (Terraform module)
- [ ] **2. Upload URL:** `presign_upload` Lambda + IAM role
- [ ] **3. API:** API Gateway HTTP API
- [ ] **4. Processing:** S3 event → `process_image` Lambda → thumbnail + Rekognition labels
- [ ] **5. Database:** DynamoDB table for metadata and tags
- [ ] **6. Gallery API:** `list_images`, `search_by_tag`, `delete_image`
- [ ] **7. Auth:** Cognito + JWT authorizer
- [ ] **8. Frontend:** React app on S3 + CloudFront (OAC)
- [ ] **9. Monitoring:** CloudWatch alarms + SNS
- [ ] **10. CI/CD:** GitHub Actions with OIDC
