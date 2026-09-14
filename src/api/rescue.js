import api from "./axios";

export const getRescues = (params) => api.get("/rescues", { params });
export const getRescue = (id) => api.get(`/rescues/${id}`);
export const createRescue = (formData) =>
  api.post("/rescues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAnimals = () => api.get("/animals");
export const getToAddresses = () => api.get("/to-addresses");
export const updateRescueDate = (id, rescue_date) => api.post(`/rescues/${id}/date`, { rescue_date });
