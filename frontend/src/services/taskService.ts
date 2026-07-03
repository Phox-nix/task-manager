import api from '@/lib/axios';
import { CreateTaskRequest, UpdateTaskRequest, TaskResponse } from '@/types';

const taskService = {
  getAllForProject: async (projectId: string): Promise<TaskResponse[]> => {
    const response = await api.get<TaskResponse[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  getById: async (projectId: string, taskId: string): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  create: async (projectId: string, data: CreateTaskRequest): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  update: async (
    projectId: string,
    taskId: string,
    data: UpdateTaskRequest,
  ): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  delete: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};

export default taskService;
