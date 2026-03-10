# Deployment Guide: GCP Pulse

This guide provides step-by-step instructions for deploying the GCP Pulse application to **Google Cloud Run**.

## 📂 File Structure

```
.
├── .env.example         # Environment variable template
├── .gitignore           # Files to ignore
├── Dockerfile.txt       # Docker build instructions
├── dockerignore.txt     # Files to ignore during Docker build
├── deploy.md            # This guide
├── index.html           # Entry HTML
├── metadata.json        # App metadata
├── package-lock.json    # Lock file
├── package.json         # Dependencies and scripts
├── server.ts            # Express server entry point
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
├── tailwind.config.js   # Tailwind config
├── packages             # Packages directory
└── src                  # Source code
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── types.ts
    ├── components/      # UI Components
    ├── hooks/           # Custom React Hooks
    └── lib/             # Utilities
```

---

## 🐳 Dockerization Strategy

The application uses a **Node.js runtime** container:

1.  **Node.js Server (Port 8080)**: Runs the Express application which serves both the API endpoints and the static frontend files.
2.  **No Nginx Required**: The Express server handles static file serving in production, simplifying the architecture.

The `Dockerfile` uses a **multi-stage build**:
*   **Builder Stage**: Runs `npm run build`, which executes both `vite build` (for the frontend) and `tsc -p tsconfig.server.json` (to compile the server).
*   **Runner Stage**: A lightweight Node.js Alpine image that runs the compiled server (`node dist/server.js`).

---

## 🚀 Deploying to Google Cloud Run

### Prerequisites

1.  **Google Cloud Project**: Create one at [console.cloud.google.com](https://console.cloud.google.com/).
2.  **Billing Enabled**: Ensure billing is active.
3.  **Google Cloud SDK (gcloud)**: Installed and authenticated.
    *   Run `gcloud auth login`
    *   Run `gcloud config set project YOUR_PROJECT_ID`
4.  **Rename Docker Files (MANDATORY)**:
    *   Rename `Dockerfile.txt` to `Dockerfile`
    *   Rename `dockerignore.txt` to `.dockerignore`

---

### Method 1: One-Step Deployment (Recommended)

This is the simplest way to deploy. It builds the container and deploys it in a single command. 

*Note: The application has been updated to support runtime environment variable injection. This means the API keys you provide in this command will be correctly passed to the frontend without needing to be hardcoded during the build step.*

```bash
gcloud run deploy gcp-pulse \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key",YOUTUBE_API_KEY="your_youtube_api_key"
```

---

### Method 2: Manual Build and Push (Advanced)

Use this if you need to store the image in a registry for versioning or CI/CD.

#### Step 1: Build and Push the Image

```bash
# 1. Create an Artifact Registry repository (if not already created)
gcloud artifacts repositories create gcp-pulse-repo \
    --repository-format=docker \
    --location=us-central1

# 2. Build and push the image
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gcp-pulse-repo/gcp-pulse:latest
```

#### Step 2: Deploy Service

```bash
gcloud run deploy gcp-pulse-service \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gcp-pulse-repo/gcp-pulse:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key",YOUTUBE_API_KEY="your_youtube_api_key"
```

**Configuration Flags:**
*   `--allow-unauthenticated`: Makes the app public. Remove for internal-only apps.
*   `--set-env-vars`: **Required**. The app needs `GEMINI_API_KEY` and `YOUTUBE_API_KEY` for AI and enrichment features.
*   `--port 8080`: Tells Cloud Run to route traffic to port 8080 inside your container.

### Step 3: Verify

You will see a URL like: `https://gcp-pulse-service-uc.a.run.app`. Click it to verify the deployment.

---

## 🛠️ Troubleshooting

**1. "Build failed"**
*   Ensure `package.json` and `package-lock.json` are present.
*   Check that `Dockerfile.txt` is correctly named (or renamed to `Dockerfile`).

**2. 500 Error / Crash on Start**
*   Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gcp-pulse-service" --limit 20`
*   Common cause: Missing `GEMINI_API_KEY` environment variable.

**3. YouTube Data Missing**
*   Ensure `YOUTUBE_API_KEY` is set correctly. The app will log errors if enrichment fails.

---

## 💻 Local Development

1.  **Install**: `npm install`
2.  **Env**: Create a `.env` file with:
    ```env
    GEMINI_API_KEY=your_key
    YOUTUBE_API_KEY=your_key
    ```
3.  **Run**: `npm run dev` (Access at `http://localhost:8080`)

