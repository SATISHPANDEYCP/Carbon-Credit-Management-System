import axiosInstance from './axiosInstance';

export const measureEmission = async (data) => {
  const response = await axiosInstance.post('/carbon/measure', data);
  return response.data;
};

export const logReduction = async (data) => {
  const response = await axiosInstance.post('/carbon/reduce', data);
  return response.data;
};

export const purchaseOffset = async (data) => {
  const response = await axiosInstance.post('/carbon/offset', data);
  return response.data;
};

export const getOffsetProjects = async () => {
  const response = await axiosInstance.get('/carbon/offset/projects');
  return response.data;
};

export const shareCredits = async (data) => {
  const response = await axiosInstance.post('/carbon/share', data);
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await axiosInstance.get('/dashboard/summary');
  return response.data;
};

export const getTransactionHistory = async (page = 1, limit = 50) => {
  const response = await axiosInstance.get('/dashboard/transactions', {
    params: { page, limit }
  });
  return response.data;
};
