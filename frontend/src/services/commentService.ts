import api from '@/lib/axios';
import { CreateCommentRequest, CommentResponse } from '@/types';

const commentService = {
  getAllForTask: async (taskId: string): Promise<CommentResponse[]> => {
    const response = await api.get<CommentResponse[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  create: async (taskId: string, data: CreateCommentRequest): Promise<CommentResponse> => {
    const response = await api.post<CommentResponse>(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  delete: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};

export default commentService;
