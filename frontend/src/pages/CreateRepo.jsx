import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createRepo } from "../services/repoService";

import "../styles/pages.css";

const CreateRepo = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    private: false,
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Repository name is required");
      return;
    }

    try {

      setLoading(true);

      await createRepo(form);

      alert("Repository created successfully");

      navigate("/view");

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data?.detail ||
        "Failed to create repository"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="page">

      <h1 className="page-title">
        Create Repository
      </h1>

      <div className="underline"></div>

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          placeholder="Repository Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />

        <textarea
          placeholder="Repository Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value
            })
          }
        />

        <select
          value={form.private}
          onChange={(e) =>
            setForm({
              ...form,
              private:
                e.target.value === "true"
            })
          }
        >

          <option value="false">
            Public Repository
          </option>

          <option value="true">
            Private Repository
          </option>

        </select>

        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >

          {
            loading
              ? "Creating..."
              : "Create Repository"
          }

        </button>

      </form>

    </div>
  );
};

export default CreateRepo;