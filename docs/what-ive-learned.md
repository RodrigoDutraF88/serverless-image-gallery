# What I´ve Learned so far



Data pipelines for ETL processes
Both AI/ML and traditional data analytics need clean and accessible data in a format that's usable by analytics tools and AI algorithms. ETL processes are used for this purpose. With ETL, you perform the following steps:

Extract the data from various sources and store it.
Transform it into a consistent, usable format for downstream tools to consume.
Load it into a destination system, like a data warehouse or analytics platform.

I learned about AM Users and Budgets in AWS accounts.

My first task is to create a private s3 bucket with Terraform, which allows infrastructure as code.
First i did created the main.tf
Second task is to write the storage module then finally use the module and deploy.

Terraform is an Infrastructure as Code (IaC) tool that allows you to create, configure, and manage cloud infrastructure using code instead of manually clicking through a cloud provider's dashboard.

From all of the Patterns for building an API to upload files to Amazon S3, using API Gateway with presigned URLs allow you to access to S3 objects for a specific period. This time-bound access helps prevent unauthorized access to S3 objects and provides an additional layer of security.
The workflow is
USER HTTP GET getUploadUrl -> API Gateway -> AWS Lambda Generates Presign URL
then
USER HTTP PUT presign url -> Amazon S3

The API Gateway allows to create a public URL (post) that someone can access 
Browser → API Gateway → Lambda presign_upload → URL assigned → upload to S3

The first Lambda layer, now S3 calls it automatically whenever a file lands in uploads/, with nobody asking

Amazon Rekognition is a fully managed cloud-based computer vision service by Amazon Web Services (AWS) that allows you to analyze images and videos using machine learning without needing prior AI or ML experience

What each folder is for
serverless-image-gallery/
├── backend/
│   ├── functions/          Python code for each Lambda, one folder per function
│   │   ├── presign_upload/   app.py: returns a signed upload URL       (Phase 2)
│   │   ├── process_image/    app.py: thumbnail + Rekognition labels    (Phase 4)
│   │   ├── list_images/      empty, Phase 6
│   │   ├── search_by_tag/    empty, Phase 6
│   │   └── delete_image/     empty, Phase 6
│   ├── shared/             code reused by several functions (e.g. DynamoDB helpers)
│   └── tests/              unit tests for the functions
│
├── infra/                  everything Terraform
│   ├── modules/            reusable building blocks, they define "how"
│   │   ├── storage/          S3 bucket, public access block, encryption
│   │   ├── compute/          one Lambda: role, policy, log group, function
│   │   ├── api/              API Gateway: API, stage, route, integration
│   │   ├── database/         DynamoDB      (Phase 5)
│   │   ├── auth/             Cognito       (Phase 7)
│   │   ├── cdn/              CloudFront    (Phase 8)
│   │   └── monitoring/       alarms + SNS  (Phase 9)
│   └── environments/
│       └── dev/            the "root": where you run terraform. It says "what":
│                             which modules, with which names, wired together
│
├── build/                  generated files (Pillow layer, zips). Not in git.
├── frontend/               the React website  (Phase 8)
├── docs/                   roadmap, learning notes, ADRs (decision records)
└── .github/workflows/      CI/CD pipelines     (Phase 10)

Dynamo DB: i already know that it was a NoSQL service, but i did not know much about the partition key and sort key. Partition Key must be unique if it is the only primary key
and sort key is optional and used toguether with the partition key. itens with the same partition key are organized by Sort key
I understood that the query retrieves itens using a specift partition key and can optionally filter results by sort key
In the other hand, Scan examines every item in the table or index 

Amazon Cognito provides comprehensive identity and access management for both human and non-human identities.