import { createContext, useContext, useState } from "react";
import { getRepos, createRepo, uploadFile } from "../services/repoService";

const RepoContext = createContext();

export const RepoProvider = ({ children }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRepos = async (username) => {
    try {
      setLoading(true);
      const data = await getRepos();
      setRepos(data.repos || data || []);
    } finally {
      setLoading(false);
    }
  };

  const addRepo = async (repoData) => {
    const data = await createRepo(repoData);
    return data;
  };

  const uploadRepoFile = async (owner, repoName, fileData) => {
    const data = await uploadFile(owner, repoName, fileData);
    return data;
  };

  return (
    <RepoContext.Provider
      value={{
        repos,
        loading,
        fetchRepos,
        addRepo,
        uploadRepoFile,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);