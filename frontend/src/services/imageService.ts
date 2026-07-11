import api from '@/lib/axios';

const imageService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ url: string }>('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },

  updateProjectImage: async (projectId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await api.patch(`/projects/${projectId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default imageService;
