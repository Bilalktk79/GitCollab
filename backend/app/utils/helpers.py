from bson import ObjectId


# -----------------------------
# Convert Mongo ObjectId
# -----------------------------

def serialize_mongo_data(data):

    if isinstance(data, list):

        for item in data:
            item["_id"] = str(item["_id"])

        return data

    data["_id"] = str(data["_id"])

    return data


# -----------------------------
# Validate Mongo ID
# -----------------------------

def validate_object_id(id: str):

    return ObjectId.is_valid(id)