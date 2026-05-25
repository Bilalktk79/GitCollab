from datetime import datetime
from secrets import token_urlsafe
from bson import ObjectId
from app.database.db import db


client_access_collection = db["client_access"]


def make_client_id(project_code: str):
    safe_code = project_code.strip().upper().replace("-", "_").replace(" ", "_")
    return f"client_{safe_code}"


def serialize_client_access(item):
    return {
        "id": str(item["_id"]),
        "client_id": item.get("client_id"),

        "developer_id": item.get("developer_id"),
        "developer_name": item.get("developer_name"),
        "developer_role": item.get("developer_role", "developer"),

        "repo_id": item.get("repo_id"),
        "repo_name": item.get("repo_name"),

        "client_name": item.get("client_name"),
        "client_email": item.get("client_email"),

        "project_code": item.get("project_code"),
        "is_active": item.get("is_active", True),

        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
        "revoked_at": item.get("revoked_at"),
        "activated_at": item.get("activated_at"),
        "last_accessed_at": item.get("last_accessed_at"),
        "last_client_name": item.get("last_client_name"),
    }


def create_client_access(data):
    project_code = data.project_code.strip().upper()
    client_id = make_client_id(project_code)

    existing_code = client_access_collection.find_one({
        "project_code": project_code
    })

    if existing_code:
        return {
            "success": False,
            "message": "Project code already exists. Please use another code."
        }

    developer_id = str(data.developer_id or "").strip()
    developer_name = str(data.developer_name or "").strip()
    developer_role = str(data.developer_role or "developer").strip()

    if not developer_id:
        return {
            "success": False,
            "message": "Developer ID is missing from authenticated user."
        }

    if not developer_name:
        return {
            "success": False,
            "message": "Developer name is missing from authenticated user."
        }

    if developer_role not in ["developer", "admin"]:
        return {
            "success": False,
            "message": "Only developer/admin users can create client invites."
        }

    client_access = {
        "client_id": client_id,

        # Source of truth: controller fills these from JWT/current user.
        "developer_id": developer_id,
        "developer_name": developer_name,
        "developer_role": developer_role,

        "repo_id": data.repo_id or "",
        "repo_name": data.repo_name.strip(),

        "client_name": data.client_name.strip(),
        "client_email": data.client_email or "",

        "project_code": project_code,
        "is_active": True,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "revoked_at": None,
        "activated_at": None,
        "last_accessed_at": None,
        "last_client_name": None,
        "client_token": None,
    }

    result = client_access_collection.insert_one(client_access)
    client_access["_id"] = result.inserted_id

    return {
        "success": True,
        "message": "Client access code created successfully.",
        "data": serialize_client_access(client_access)
    }


def verify_client_access(data):
    client_name = data.client_name.strip()
    project_code = data.project_code.strip().upper()

    if not client_name:
        return {
            "success": False,
            "message": "Client name is required."
        }

    if not project_code:
        return {
            "success": False,
            "message": "Project access code is required."
        }

    access_record = client_access_collection.find_one({
        "project_code": project_code
    })

    if not access_record:
        return {
            "success": False,
            "message": "Invalid project access code."
        }

    if access_record.get("is_active", True) is False:
        return {
            "success": False,
            "message": "This client access has been revoked by admin."
        }

    client_id = access_record.get("client_id") or make_client_id(project_code)
    client_token = f"client_{token_urlsafe(32)}"

    client_access_collection.update_one(
        {"_id": access_record["_id"]},
        {
            "$set": {
                "client_id": client_id,
                "last_accessed_at": datetime.utcnow(),
                "last_client_name": client_name,
                "client_token": client_token,
                "updated_at": datetime.utcnow(),
            }
        }
    )

    return {
        "success": True,
        "message": "Client access granted.",
        "token": client_token,
        "role": "client",

        "client_id": client_id,
        "client_name": client_name,

        "project_code": access_record.get("project_code"),
        "repo_id": access_record.get("repo_id"),
        "repo_name": access_record.get("repo_name"),

        "developer_id": access_record.get("developer_id"),
        "developer_name": access_record.get("developer_name"),
        "developer_role": access_record.get("developer_role", "developer"),
    }


def get_all_client_access():
    records = client_access_collection.find().sort("created_at", -1)
    return [serialize_client_access(item) for item in records]


def get_client_access_by_code(project_code: str):
    record = client_access_collection.find_one({
        "project_code": project_code.strip().upper()
    })

    if not record:
        return None

    return serialize_client_access(record)


def deactivate_client_access(access_id: str):
    if not ObjectId.is_valid(access_id):
        return None

    client_access_collection.update_one(
        {"_id": ObjectId(access_id)},
        {
            "$set": {
                "is_active": False,
                "revoked_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        }
    )

    record = client_access_collection.find_one({
        "_id": ObjectId(access_id)
    })

    if not record:
        return None

    return serialize_client_access(record)


def activate_client_access(access_id: str):
    if not ObjectId.is_valid(access_id):
        return None

    client_access_collection.update_one(
        {"_id": ObjectId(access_id)},
        {
            "$set": {
                "is_active": True,
                "activated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        }
    )

    record = client_access_collection.find_one({
        "_id": ObjectId(access_id)
    })

    if not record:
        return None

    return serialize_client_access(record)