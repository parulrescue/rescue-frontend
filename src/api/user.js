import api from "./axios";

export const getProfile = () => api.get("/users/me");
export const updateProfile = (data) => api.put("/users/me", data);
export const uploadAvatar = (formData) =>
  api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const searchUsers = (q, page = 1, limit = 20) =>
  api.get("/users/search", { params: { q, page, limit } });
export const lookupUsers = (q) => api.get("/users/lookup", { params: { q } });
