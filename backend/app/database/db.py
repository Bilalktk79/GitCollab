from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import PyMongoError
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# MongoDB URL
MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL is missing in .env file")

# MongoDB Client
client = MongoClient(MONGO_URL)

# Database
db = client["github_repo_manager"]

# Existing Collections
users_collection = db["users"]
repos_collection = db["repositories"]
files_collection = db["files"]

# Extra collections for history/logs
repo_activity_collection = db["repo_activity"]
upload_history_collection = db["upload_history"]

# Commit Review Collection
commit_reviews_collection = db["commit_reviews"]

# Collaboration Feature Collections
chat_messages_collection = db["chat_messages"]
help_posts_collection = db["help_posts"]
help_replies_collection = db["help_replies"]
notifications_collection = db["notifications"]

# Client Access Collection
client_access_collection = db["client_access"]

# Admin / System Monitoring Collections
activity_logs_collection = db["activity_logs"]
admin_audit_collection = db["admin_audit"]
admin_logs_collection = db["admin_logs"]


def safe_create_index(collection, keys, **kwargs):
    """
    Index create karte waqt agar koi existing conflict/error aaye
    to backend crash nahi hoga. Sirf warning print hogi.
    """
    try:
        collection.create_index(keys, **kwargs)
    except PyMongoError as error:
        print(
            f"[MongoDB Index Warning] Collection: {collection.name}, "
            f"Keys: {keys}, Error: {error}"
        )


def create_indexes():
    # Users indexes
    safe_create_index(
        users_collection,
        [("email", ASCENDING)],
        unique=True,
        sparse=True
    )

    safe_create_index(
        users_collection,
        [("username", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        users_collection,
        [("github_id", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        users_collection,
        [("role", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        users_collection,
        [("is_blocked", ASCENDING)]
    )

    safe_create_index(
        users_collection,
        [("created_at", DESCENDING)]
    )

    # Repositories indexes
    safe_create_index(
        repos_collection,
        [("owner", ASCENDING), ("name", ASCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("repo_id", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        repos_collection,
        [("developer_id", ASCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("client_id", ASCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("visibility", ASCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("language", ASCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        repos_collection,
        [("updated_at", DESCENDING)]
    )

    # Files indexes
    safe_create_index(
        files_collection,
        [("owner", ASCENDING), ("repo", ASCENDING), ("file_path", ASCENDING)]
    )

    safe_create_index(
        files_collection,
        [("created_at", DESCENDING)]
    )

    # Upload history indexes
    safe_create_index(
        upload_history_collection,
        [("owner", ASCENDING), ("repo", ASCENDING), ("uploaded_at", DESCENDING)]
    )

    safe_create_index(
        upload_history_collection,
        [("developer_id", ASCENDING), ("uploaded_at", DESCENDING)]
    )

    # Repo activity indexes
    safe_create_index(
        repo_activity_collection,
        [("owner", ASCENDING), ("repo", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        repo_activity_collection,
        [("developer_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        repo_activity_collection,
        [("activity_type", ASCENDING)]
    )

    # Commit Reviews indexes
    safe_create_index(
        commit_reviews_collection,
        [("commit_id", ASCENDING)],
        unique=True
    )

    safe_create_index(
        commit_reviews_collection,
        [("repo_id", ASCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("repo_name", ASCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("developer_id", ASCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("status", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("repo_id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        commit_reviews_collection,
        [("updated_at", DESCENDING)]
    )

    # Chat Messages indexes
    safe_create_index(
        chat_messages_collection,
        [("sender_id", ASCENDING), ("receiver_id", ASCENDING), ("created_at", ASCENDING)]
    )

    # Important for participant-based chat filtering
    safe_create_index(
        chat_messages_collection,
        [("participants", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        chat_messages_collection,
        [("commit_id", ASCENDING), ("created_at", ASCENDING)]
    )

    safe_create_index(
        chat_messages_collection,
        [("repo_id", ASCENDING), ("created_at", ASCENDING)]
    )

    safe_create_index(
        chat_messages_collection,
        [("is_read", ASCENDING)]
    )

    safe_create_index(
        chat_messages_collection,
        [("created_at", DESCENDING)]
    )

    # Help Posts indexes
    safe_create_index(
        help_posts_collection,
        [("developer_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        help_posts_collection,
        [("status", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        help_posts_collection,
        [("issue_type", ASCENDING)]
    )

    safe_create_index(
        help_posts_collection,
        [("commit_id", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        help_posts_collection,
        [("created_at", DESCENDING)]
    )

    # Help Replies indexes
    safe_create_index(
        help_replies_collection,
        [("help_post_id", ASCENDING), ("created_at", ASCENDING)]
    )

    safe_create_index(
        help_replies_collection,
        [("sender_id", ASCENDING), ("created_at", DESCENDING)]
    )

    # Notifications indexes
    safe_create_index(
        notifications_collection,
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        notifications_collection,
        [("is_read", ASCENDING)]
    )

    safe_create_index(
        notifications_collection,
        [("type", ASCENDING)]
    )

    safe_create_index(
        notifications_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        notifications_collection,
        [("related_id", ASCENDING)],
        sparse=True
    )

    # Client Access indexes
    safe_create_index(
        client_access_collection,
        [("project_code", ASCENDING)],
        unique=True
    )

    safe_create_index(
        client_access_collection,
        [("client_id", ASCENDING)],
        sparse=True
    )

    safe_create_index(
        client_access_collection,
        [("developer_id", ASCENDING)]
    )

    safe_create_index(
        client_access_collection,
        [("repo_id", ASCENDING)]
    )

    safe_create_index(
        client_access_collection,
        [("repo_name", ASCENDING)]
    )

    safe_create_index(
        client_access_collection,
        [("is_active", ASCENDING)]
    )

    safe_create_index(
        client_access_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        client_access_collection,
        [("last_accessed_at", DESCENDING)]
    )

    # Activity Logs indexes
    safe_create_index(
        activity_logs_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        activity_logs_collection,
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        activity_logs_collection,
        [("action", ASCENDING)]
    )

    safe_create_index(
        activity_logs_collection,
        [("target_type", ASCENDING), ("target_id", ASCENDING)]
    )

    # Admin Audit indexes
    safe_create_index(
        admin_audit_collection,
        [("admin_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        admin_audit_collection,
        [("action", ASCENDING)]
    )

    safe_create_index(
        admin_audit_collection,
        [("created_at", DESCENDING)]
    )

    # Admin Logs indexes
    safe_create_index(
        admin_logs_collection,
        [("created_at", DESCENDING)]
    )

    safe_create_index(
        admin_logs_collection,
        [("admin_id", ASCENDING), ("created_at", DESCENDING)]
    )

    safe_create_index(
        admin_logs_collection,
        [("admin_name", ASCENDING)]
    )

    safe_create_index(
        admin_logs_collection,
        [("action_type", ASCENDING)]
    )

    safe_create_index(
        admin_logs_collection,
        [("target_type", ASCENDING), ("target_id", ASCENDING)]
    )


create_indexes()