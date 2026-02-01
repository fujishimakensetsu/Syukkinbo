# WIF (Workload Identity Federation) を使用した Google Cloud Run 自動デプロイガイド

このガイドでは、GitHub Actions と Workload Identity Federation を使用して、GitHubへのプッシュ時に自動的に Google Cloud Run へデプロイする方法を説明します。

---

## 目次

1. [前提条件](#前提条件)
2. [必要な情報の準備](#必要な情報の準備)
3. [Google Cloud の設定](#google-cloud-の設定)
4. [GitHub Actions の設定](#github-actions-の設定)
5. [プロジェクトファイルの準備](#プロジェクトファイルの準備)
6. [デプロイの実行](#デプロイの実行)
7. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Google Cloud アカウントとプロジェクト
- GitHub アカウントとリポジトリ
- ローカル環境に以下がインストール済み:
  - [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
  - Git
  - Docker (ローカルテスト用、オプション)

---

## 必要な情報の準備

デプロイ前に以下の情報を決定・確認してください。

| 項目 | 説明 | 例 |
|------|------|-----|
| `PROJECT_ID` | Google Cloud プロジェクト ID | `syukkinboapp` |
| `PROJECT_NUMBER` | Google Cloud プロジェクト番号 | `780012577796` |
| `REGION` | デプロイするリージョン | `asia-northeast1` |
| `SERVICE_NAME` | Cloud Run サービス名 | `syukkinbo` |
| `REPOSITORY_NAME` | Artifact Registry リポジトリ名 | `syukkinbo` |
| `GITHUB_OWNER` | GitHub オーナー名（ユーザーまたは組織） | `fujishimakensetsu` |
| `GITHUB_REPO` | GitHub リポジトリ名 | `Syukkinbo` |

### プロジェクト番号の確認方法

```bash
gcloud projects describe PROJECT_ID --format="value(projectNumber)"
```

---

## Google Cloud の設定

### 1. gcloud CLI の認証とプロジェクト設定

```bash
# 認証
gcloud auth login

# プロジェクト設定
gcloud config set project PROJECT_ID
```

### 2. 必要な API の有効化

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  --project PROJECT_ID
```

### 3. Artifact Registry リポジトリの作成

```bash
gcloud artifacts repositories create REPOSITORY_NAME \
  --repository-format=docker \
  --location=REGION \
  --project=PROJECT_ID
```

### 4. Workload Identity Pool の作成

```bash
gcloud iam workload-identity-pools create "github-pool" \
  --project="PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Pool"
```

### 5. Workload Identity Provider の作成

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'GITHUB_OWNER'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 6. サービスアカウントの作成

```bash
gcloud iam service-accounts create github-actions-sa \
  --project="PROJECT_ID" \
  --display-name="GitHub Actions Service Account"
```

### 7. サービスアカウントへの権限付与

```bash
# Cloud Run 管理者権限
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry 書き込み権限
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# サービスアカウントユーザー権限
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 8. Workload Identity とサービスアカウントの紐付け

```bash
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-sa@PROJECT_ID.iam.gserviceaccount.com \
  --project="PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/GITHUB_OWNER/GITHUB_REPO"
```

---

## GitHub Actions の設定

### ワークフローファイルの作成

`.github/workflows/deploy.yml` を作成します。

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: PROJECT_ID
  REGION: REGION
  SERVICE_NAME: SERVICE_NAME
  REPOSITORY: REPOSITORY_NAME
  IMAGE_NAME: app

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
          service_account: github-actions-sa@PROJECT_ID.iam.gserviceaccount.com

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:latest

      - name: Push Docker image
        run: |
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --region ${{ env.REGION }} \
            --allow-unauthenticated
```

---

## プロジェクトファイルの準備

### 必須ファイル

#### 1. Dockerfile

React アプリの場合の例:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. nginx.conf（React/静的サイトの場合）

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. .gitignore

```
node_modules/
build/
.env
.env.local
.DS_Store
```

---

## デプロイの実行

### 初回デプロイ（手動）

```bash
# Git リポジトリの初期化とプッシュ
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/GITHUB_OWNER/GITHUB_REPO.git
git push -u origin main
```

### 以降の自動デプロイ

`main` ブランチにプッシュするだけで自動的にデプロイされます。

```bash
git add .
git commit -m "Update message"
git push
```

### デプロイ状況の確認

- **GitHub Actions**: `https://github.com/GITHUB_OWNER/GITHUB_REPO/actions`
- **Cloud Run Console**: `https://console.cloud.google.com/run?project=PROJECT_ID`

---

## トラブルシューティング

### よくあるエラーと対処法

#### 1. 認証エラー: `PERMISSION_DENIED`

```
Error: Permission 'iam.serviceAccounts.getAccessToken' denied
```

**対処法**: サービスアカウントの権限を確認
```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com"
```

#### 2. Artifact Registry エラー

```
Error: denied: Permission 'artifactregistry.repositories.uploadArtifacts' denied
```

**対処法**: Artifact Registry への書き込み権限を追加
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

#### 3. Docker ビルドエラー

```
npm ci: package-lock.json out of sync
```

**対処法**: package-lock.json を再生成
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push
```

#### 4. API 未有効化エラー

```
Error: API [xxx.googleapis.com] not enabled
```

**対処法**: 必要な API を有効化
```bash
gcloud services enable xxx.googleapis.com --project PROJECT_ID
```

---

## クイックリファレンス

### コマンド一覧

| 操作 | コマンド |
|------|---------|
| プロジェクト設定 | `gcloud config set project PROJECT_ID` |
| 認証 | `gcloud auth login` |
| サービス一覧 | `gcloud run services list --region REGION` |
| ログ確認 | `gcloud run services logs read SERVICE_NAME --region REGION` |
| サービス削除 | `gcloud run services delete SERVICE_NAME --region REGION` |

### 重要な URL

| リソース | URL |
|----------|-----|
| Cloud Run Console | `https://console.cloud.google.com/run` |
| Artifact Registry | `https://console.cloud.google.com/artifacts` |
| IAM & Admin | `https://console.cloud.google.com/iam-admin` |
| Workload Identity | `https://console.cloud.google.com/iam-admin/workload-identity-pools` |
| GitHub Actions | `https://github.com/GITHUB_OWNER/GITHUB_REPO/actions` |

---

## 参考リンク

- [Workload Identity Federation 公式ドキュメント](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run 公式ドキュメント](https://cloud.google.com/run/docs)
- [GitHub Actions での認証](https://github.com/google-github-actions/auth)
- [Artifact Registry 公式ドキュメント](https://cloud.google.com/artifact-registry/docs)
