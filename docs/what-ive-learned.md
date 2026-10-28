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