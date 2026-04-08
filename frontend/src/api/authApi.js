import axiosInstance from './axiosInstance';

export const register = async (name, email, country, city) => {
  const response = await axiosInstance.post('/auth/register', { name, email, country, city });
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await axiosInstance.post('/auth/send-otp', { email });
  return response.data;
};

export const login = async (email, otp) => {
  const response = await axiosInstance.post('/auth/login', { email, otp });
  return response.data;
};
