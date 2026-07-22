import axios from 'axios';
import type { QuestionRequest, QuestionResponse } from '../types';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 12000,
});

export async function submitQuestionRequest(question: string): Promise<QuestionResponse> {
  const payload: QuestionRequest = { question };

  try {
    const response = await api.post<QuestionResponse>('/api/ask', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('The request timed out. Please try again.');
      }
      if (!error.response) {
        throw new Error('Unable to reach the server. Please try again.');
      }
      throw new Error(error.response.data?.message || 'Unexpected error while submitting question.');
    }

    throw new Error('Unexpected error while submitting question.');
  }
}

export default api;
