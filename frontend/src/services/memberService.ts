import api from '@/lib/axios';
import { AddMemberRequest, MemberResponse } from '@/types';

const memberService = {
  getAll: async (projectId: string): Promise<MemberResponse[]> => {
    const response = await api.get<MemberResponse[]>(`/projects/${projectId}/members`);
    return response.data;
  },

  add: async (projectId: string, data: AddMemberRequest): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>(`/projects/${projectId}/members`, data);
    return response.data;
  },

  remove: async (projectId: string, memberId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};

export default memberService;
