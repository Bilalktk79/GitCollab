import api from "./api";

export const getRepos = async () => {
  const res = await api.get("/api/github/repos");
  return res.data;
};

export const getStarredRepos = async () => {
  const res = await api.get("/api/github/repos/starred");
  return res.data;
};

export const createRepo = async (repoData) => {
  const res = await api.post("/api/github/repos/create", repoData);
  return res.data;
};

export const deleteRepo = async (owner, repoName) => {
  const res = await api.delete(`/api/github/repos/${owner}/${repoName}`);
  return res.data;
};

export const uploadFile = async (owner, repoName, fileData) => {
  const res = await api.post(
    `/api/github/repos/${owner}/${repoName}/upload`,
    fileData
  );
  return res.data;
};

export const updateRepo = async (owner, oldRepoName, repoData) => {
  const res = await api.patch(
    `/api/github/repos/${owner}/${oldRepoName}`,
    repoData
  );
  return res.data;
};