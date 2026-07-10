'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import memberService from '@/services/memberService';
import projectService from '@/services/projectService';
import { AddMemberRequest } from '@/types';
import useAuthStore from '@/store/authStore';

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: () => memberService.getAll(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberRequest>();

  const addMutation = useMutation({
    mutationFn: (data: AddMemberRequest) => memberService.add(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      reset();
      setServerError('');
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.message || 'Failed to add member');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => memberService.remove(id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const isOwner = project?.ownerId === user?.userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading members...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push(`/projects/${id}`)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← {project?.name}
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
          <p className="text-gray-500 mt-1">
            {members?.length} member{members?.length !== 1 ? 's' : ''} in this project
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Add member
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {/* Owner row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{project?.ownerName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Project owner</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Owner</span>
        </div>

        {/* Member rows */}
        {members?.map((member) => (
          <div key={member.userId} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {member.role}
              </span>
              {isOwner && (
                <button
                  onClick={() => removeMutation.mutate(member.userId)}
                  disabled={removeMutation.isPending}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {members?.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400 text-sm">No members yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add member</h2>
            <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="member@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-red-600 text-sm">{serverError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                    setServerError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || addMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {addMutation.isPending ? 'Adding...' : 'Add member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
