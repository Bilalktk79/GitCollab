import { useEffect, useState } from "react";
import { getRepos } from "../services/repoService";

const useRepos = (username) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepos = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError("");

      const data = await getRepos(username);
      setRepos(data.repos || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [username]);

  return { repos, loading, error, refetch: fetchRepos };
};

export default useRepos;