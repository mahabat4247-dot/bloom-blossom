# 🌸 Bloom & Blossom - Modern & Elegant Flower Shop Website

[![CI/CD Pipeline](https://github.com/your-org/bloom-and-blossom/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/bloom-and-blossom/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-sage)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

**Bloom & Blossom** is a modern, elegant, and fully responsive static web application designed as a beginner-friendly DevOps project. It demonstrates modern web styling, clean vanilla JavaScript, Docker multi-stage containerization, Nginx configuration, security scanning, static code analysis, and automated AWS ECR deployment via GitHub Actions CI/CD pipelines.

---

## 📋 Table of Contents

1. [Project Structure](#-project-structure)
2. [Website Features & Design](#-website-features--design)
3. [Local Development & Building](#-local-development--building)
4. [Docker & Nginx Local Testing](#-docker--nginx-local-testing)
5. [GitHub Repository Configuration](#-github-repository-configuration)
6. [AWS ECR, IAM Least-Privilege & OIDC Setup](#-aws-ecr-iam-least-privilege--oidc-setup)
7. [SonarQube Configuration](#-sonarqube-configuration)
8. [Trivy Security Scanning & Failure Thresholds](#-trivy-security-scanning--failure-thresholds)
9. [CI/CD Pipeline Workflow (Step-by-Step)](#-cicd-pipeline-workflow-step-by-step)
10. [EC2 Deployment Guide](#-ec2-deployment-guide)

---

## 📁 Project Structure

```text
bloom-and-blossom/
├── .github/
│   └── workflows/
│       └── ci.yml                 # 6-stage GitHub Actions CI/CD pipeline
├── .dockerignore                  # Docker build exclusions
├── .gitignore                     # Git tracking exclusions
├── .htmlhintrc                    # HTMLHint static code linting rules
├── eslint.config.mjs              # ESLint configuration (Flat Config format)
├── Dockerfile                     # Multi-stage Docker build (Node build -> Nginx alpine)
├── nginx.conf                     # Production-ready Nginx web server configuration
├── index.html                     # HTML5 semantic website structure
├── styles.css                     # CSS3 styling (Blush, Cream, Sage Green theme)
├── script.js                      # Vanilla JavaScript cart & UI logic
├── package.json                   # Node.js dependencies and lifecycle scripts
├── package-lock.json              # Locked dependency tree
├── sonar-project.properties       # SonarQube static code analysis configuration
└── README.md                      # Complete project & DevOps documentation
```

---

## 🌸 Website Features & Design Style

* **Visual Aesthetics**: Designed with soft blush pink (`#FBF0EF`), warm cream (`#FCFAF7`), rich sage green (`#8A9A86`), and charcoal typography.
* **Responsive Layout**: Seamless experience across mobile, tablet, and desktop viewports.
* **Sections**:
  1. **Header**: Logo, navigation links, and animated shopping cart drawer button.
  2. **Hero**: Headline, high-resolution bouquet photograph, badge highlights, and call-to-action button.
  3. **Featured Catalog**: 6 rounded product cards featuring bouquet imagery, description, price, and "Add to Cart" buttons.
  4. **Interactive Cart**: Quantity controls (+ / -), item removal, real-time total calculation, and persistent `localStorage` state.
  5. **About Us**: Story, values, and stat counter badges.
  6. **Contact**: Sample address, opening hours, phone details, and inquiry form.
  7. **Footer**: Navigation links, social icons, and demo notice.
* **Image Resilience**: Automatic SVG fallback rendering when external image URLs fail or are blocked.

---

## 🛠️ Local Development & Building

### Prerequisites
* **Node.js**: `v20.0.0` or newer
* **npm**: `v10.0.0` or newer

### 1. Install Dependencies
```bash
npm ci
```

### 2. Code Quality & Linting
Run HTMLHint for HTML structure and ESLint for JavaScript logic:
```bash
# Lint HTML only
npm run lint:html

# Lint JavaScript only
npm run lint:js

# Run all linters
npm run lint
```

### 3. Build Distribution Bundle
Builds the static distribution in `dist/`:
```bash
npm run build
```
This generates a clean `dist/` directory containing `index.html`, `styles.css`, and `script.js`.

---

## 🐳 Docker & Nginx Local Testing

### 1. Build the Docker Image
```bash
docker build -t bloom-and-blossom:latest .
```

### 2. Run the Container Locally
```bash
docker run -d -p 8080:80 --name bloom-app bloom-and-blossom:latest
```

### 3. Verify Container Health & Website Access
* Open your browser at `http://localhost:8080`
* Check health check endpoint: `http://localhost:8080/health` (returns `OK`)

---

## 🔑 GitHub Repository Configuration

To enable automated scanning and publishing, configure the following **Secrets** and **Variables** in your GitHub repository (`Settings -> Secrets and variables -> Actions`):

| Type | Name | Description / Example Value |
| :--- | :--- | :--- |
| **Secret** | `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/GitHubActions-BloomBlossom-Role` |
| **Secret** | `SONAR_TOKEN` | Token generated from SonarQube / SonarCloud account |
| **Secret** | `SONAR_HOST_URL` | `https://sonarcloud.io` or `https://your-sonarqube-server.com` |
| **Variable** | `AWS_REGION` | `us-east-1` |
| **Variable** | `ECR_REPOSITORY` | `bloom-and-blossom` |

---

## ☁️ AWS ECR, IAM Least-Privilege & OIDC Setup

Instead of storing long-lived AWS Access Keys, this project uses **GitHub Actions OIDC Authentication** to request temporary credentials securely.

### 1. Create an OpenID Connect (OIDC) Provider in AWS
* **Provider URL**: `https://token.actions.githubusercontent.com`
* **Audience**: `sts.amazonaws.com`

### 2. Create an AWS IAM Role for GitHub Actions
Create an IAM Role with a Trust Policy permitting GitHub Actions to assume the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

### 3. Attach Least-Privilege IAM Policy
Attach permissions required only for logging into ECR and pushing images:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/bloom-and-blossom"
    }
  ]
}
```

### 4. Create Amazon ECR Repository
```bash
aws ecr create-repository \
    --repository-name bloom-and-blossom \
    --region us-east-1
```

---

## 📊 SonarQube Configuration

SonarQube static code quality parameters are configured in `sonar-project.properties`:

```properties
sonar.projectKey=bloom-and-blossom
sonar.projectName=Bloom & Blossom
sonar.projectVersion=1.0.0
sonar.sources=.
sonar.exclusions=node_modules/**,dist/**,coverage/**,.git/**
sonar.sourceEncoding=UTF-8
```

Ensure `SONAR_TOKEN` and `SONAR_HOST_URL` secrets are present in GitHub repository settings.

---

## 🛡️ Trivy Security Scanning & Failure Thresholds

Trivy scans the source repository filesystem for security vulnerabilities and misconfigurations.

```yaml
- name: Run Trivy Vulnerability & Misconfig Scanner
  uses: aquasecurity/trivy-action@0.29.0
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'table'
    exit-code: '1'          # Exits with non-zero code to block pipeline if vulnerabilities are found
    ignore-unfixed: true   # Focus on actionable, fixable vulnerabilities
    severity: 'HIGH,CRITICAL'
```

* **Blocking Behavior**: `exit-code: '1'` ensures that if `HIGH` or `CRITICAL` vulnerabilities exist, the build job fails and blocks ECR image publication.
* **Non-blocking / Audit Mode**: Set `exit-code: '0'` if you only wish to output vulnerability reports without failing the build.

---

## 🔄 CI/CD Pipeline Workflow (Step-by-Step)

The workflow (`.github/workflows/ci.yml`) consists of 6 distinct stages:

```text
[ Lint Codebase ]  ──┐
                     ├──> [ SonarQube Scan ]       ──┐
[ Build Website ]  ──┼──> [ Trivy Security Scan ]  ──┼──> [ Publish to Amazon ECR ]
                     └──> [ Docker Build Test ]    ──┘
```

1. **Lint**: Checks HTML structure with `htmlhint` and JavaScript quality with `eslint`.
2. **Build Website**: Generates the static website bundle inside `dist/` and archives the artifact.
3. **SonarQube Scan**: Analyzes code quality and maintains technical debt metrics.
4. **Trivy Security Scan**: Scans repository files for vulnerabilities (`HIGH` or `CRITICAL`).
5. **Docker Build Test**: Validates that `Dockerfile` compiles cleanly without pushing to registry.
6. **Publish to Amazon ECR**: Executes **only on push to main branch** after all previous jobs succeed. Authenticates via AWS OIDC and tags image with both `${{ github.sha }}` and `latest`.

---

## 🚀 EC2 Deployment Guide

Follow these steps to deploy the containerized Bloom & Blossom website to an AWS EC2 instance:

### Step 1: Launch EC2 Instance
* **AMI**: Amazon Linux 2023 or Ubuntu 24.04 LTS
* **Instance Type**: `t2.micro` or `t3.micro` (Free Tier eligible)
* **Security Group**: Open Inbound HTTP (Port `80`) and SSH (Port `22`)

### Step 2: Install Docker on EC2
```bash
# Update system packages
sudo yum update -y   # For Amazon Linux
# OR sudo apt update && sudo apt upgrade -y # For Ubuntu

# Install Docker
sudo yum install docker -y
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# Log out and back in to apply group permissions
exit
```

### Step 3: Authenticate EC2 with AWS ECR & Pull Image
```bash
# Authenticate Docker to your ECR registry
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Pull the latest image
docker pull 123456789012.dkr.ecr.us-east-1.amazonaws.com/bloom-and-blossom:latest
```

### Step 4: Run Container on EC2
```bash
# Stop any existing container
docker stop bloom-website || true
docker rm bloom-website || true

# Run website container on port 80
docker run -d \
  --name bloom-website \
  --restart always \
  -p 80:80 \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/bloom-and-blossom:latest
```

### Step 5: Verify Deployment
Visit `http://<YOUR_EC2_PUBLIC_IP>` in your browser to view your live Bloom & Blossom website!
