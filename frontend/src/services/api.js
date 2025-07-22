import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

export const sendMessage = async (data) => {
  return axios.post(`${API_URL}/chat`, data);
};

export const getTeacherChat = async (schoolName, teacherName) => {
  return axios.get(`${API_URL}/chat/${schoolName}/${teacherName}`);
};

export const getAllChats = async () => {
  return axios.get(`${API_URL}/chats`);
};

export const replyToChat = async (chatId, message) => {
  return axios.post(`${API_URL}/chat/reply`, { chatId, message });
};

export const closeChat = async (chatId) => {
  return axios.post(`${API_URL}/chat/close`, { chatId });
};