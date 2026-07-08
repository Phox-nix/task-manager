'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import projectService from '@/services/projectService';
import { CreateProjectRequest } from '@/types';
import { useForm } from 'react-hook-form';

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectRequest>();

  const createMutation = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate the projects query to refetch the updated list
      setShowModal(false);
      reset();
    },
  });

  const onSubmit = async (data: CreateProjectRequest) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          New project
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 mb-4">No projects yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 text-sm hover:underline">
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'Active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                </span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">New project</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My awesome project"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {createMutation.isPending ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
