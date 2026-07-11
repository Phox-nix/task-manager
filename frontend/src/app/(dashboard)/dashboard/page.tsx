'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import projectService from '@/services/projectService';
import useAuthStore from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const activeProjects = projects?.filter((p) => p.status === 'Active') ?? [];
  const totalProjects = projects?.length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.fullName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your work</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total projects</p>
          <p className="text-3xl font-semibold text-gray-900">{totalProjects}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Active projects</p>
          <p className="text-3xl font-semibold text-gray-900">{activeProjects.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total members</p>
          <p className="text-3xl font-semibold text-gray-900">
            {projects?.reduce((acc, p) => acc + p.memberCount, 0) ?? 0}
          </p>
        </div>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent projects</h2>
          <button
            onClick={() => router.push('/projects')}
            className="text-sm text-blue-600 hover:underline">
            View all
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 mb-3">No projects yet</p>
            <button
              onClick={() => router.push('/projects')}
              className="text-blue-600 text-sm hover:underline">
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-white rounded-2xl border border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100" />
                )}
                <div className="p-6">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
