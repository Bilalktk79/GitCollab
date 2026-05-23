from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
# Existing Route Imports
from app.routes.auth_routes import router as auth_router
from app.routes.repo_routes import router as repo_router
from app.routes.file_routes import router as file_router

# GitHub Feature Route Imports
from app.routes.github_routes import router as github_router
from app.routes.collaborator_routes import router as collaborator_router

# App Feature Route Imports
from app.routes.chat_routes import router as chat_router
from app.routes.help_routes import router as help_router
from app.routes.notification_routes import router as notification_router
from app.routes.client_routes import router as client_router
from app.routes.commit_review_routes import router as commit_review_router
from app.routes.admin_routes import router as admin_router

app = FastAPI(
    title="GitHub Repository Manager API",
    description="Backend API for GitHub Repository Management System",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL and FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root Route
@app.get("/")
def home():
    return {
        "message": "GitHub Repository Manager Backend Running 🚀",
        "docs": "http://127.0.0.1:8000/docs",
        "health": "http://127.0.0.1:8000/health",
    }


# Health Check Route
@app.get("/health")
def health_check():
    return {
        "status": "Server is healthy ✅",
        "api": "running",
    }


# Authentication Routes
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"],
)


# Chat, Help Room, Notifications
app.include_router(chat_router)
app.include_router(help_router)
app.include_router(notification_router)


# Local Repository Routes
app.include_router(
    repo_router,
    prefix="/api/repos",
    tags=["Local Repositories"],
)


# Client Access Routes
app.include_router(client_router)

# Admin Routes
app.include_router(admin_router)

# File Upload Routes
app.include_router(
    file_router,
    prefix="/api/files",
    tags=["Files"],
)


# Commit Review Center Routes
# Endpoints:
# GET    /api/commits/all
# POST   /api/commits/create
# GET    /api/commits/{commit_id}
# PUT    /api/commits/{commit_id}/status
# DELETE /api/commits/{commit_id}
app.include_router(commit_review_router)


# GitHub Repository Routes
# Endpoints:
# GET    /api/github/repos
# GET    /api/github/repos/starred
# POST   /api/github/repos/create
# PATCH  /api/github/repos/{owner}/{repo}
# DELETE /api/github/repos/{owner}/{repo}
# POST   /api/github/repos/{owner}/{repo}/upload
app.include_router(
    github_router,
    prefix="/api/github",
    tags=["GitHub Repositories"],
)


# GitHub Collaborator Routes
app.include_router(
    collaborator_router,
    prefix="/api/github",
    tags=["GitHub Collaborators"],
)