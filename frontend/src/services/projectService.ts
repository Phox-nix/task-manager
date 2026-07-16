import api from '@/lib/axios';
import { CreateProjectRequest, UpdateProjectRequest, ProjectResponse } from '@/types';

const projectService = {
  getAll: async (): Promise<ProjectResponse[]> => {
    const response = await api.get<ProjectResponse[]>('/projects');
    return response.data;
  },
  getById: async (id: string): Promise<ProjectResponse> => {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },
  create: async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data;
  },
  update: async (id: string, data: UpdateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.put<ProjectResponse>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default projectService;
