'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import commentService from '@/services/commentService';
import {
  CreateTaskRequest,
  TaskResponse,
  UpdateProjectRequest,
  CreateCommentRequest,
} from '@/types';
import taskService from '@/services/taskService';
import projectService from '@/services/projectService';
import imageService from '@/services/imageService';

const STATUS_COLUMNS = ['Todo', 'InProgress', 'Done'];

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getAllForProject(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskRequest>({
    defaultValues: { priority: 'Medium' },
  });
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue,
  } = useForm<UpdateProjectRequest>({
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      status: project?.status ?? 'Active',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setShowModal(false);
      reset();
    },
  });
  const updateProjectMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectService.update(id, data),
    onSuccess: async (updatedProject) => {
      if (editImageFile) {
        await imageService.updateProjectImage(id, editImageFile);
      }
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowEditModal(false);
      setEditImageFile(null);
      setEditImagePreview(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => {
      const task = tasks?.find((t) => t.id === taskId)!;
      return taskService.update(id, taskId, {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(id, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setSelectedTask(null);
    },
  });

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const getTasksByStatus = (status: string) => tasks?.filter((t) => t.status === status) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push('/projects')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Projects
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{project?.name}</h1>
          <p className="text-gray-500 mt-1">{project?.description}</p>
          <button
            onClick={() => router.push(`/projects/${id}/members`)}
            className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            {project?.memberCount} member{project?.memberCount !== 1 ? 's' : ''} →
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setValue('name', project?.name ?? '');
              setValue('description', project?.description ?? '');
              setValue('status', project?.status ?? 'Active');
              setShowEditModal(true);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Edit project
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Add task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((status) => (
          <div key={status} className="bg-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                {status === 'InProgress' ? 'In Progress' : status}
              </h3>
              <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full">
                {getTasksByStatus(status).length}
              </span>
            </div>
            <div className="space-y-3">
              {getTasksByStatus(status).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.assigneeName && (
                      <span className="text-xs text-gray-400">{task.assigneeName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedTask.title}</h2>
            <p className="text-gray-500 text-sm mb-6">
              {selectedTask.description || 'No description'}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => {
                    updateStatusMutation.mutate({
                      taskId: selectedTask.id,
                      status: e.target.value,
                    });
                    setSelectedTask({ ...selectedTask, status: e.target.value });
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUS_COLUMNS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'InProgress' ? 'In Progress' : s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Priority</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[selectedTask.priority]}`}>
                  {selectedTask.priority}
                </span>
              </div>
              {selectedTask.assigneeName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assignee</span>
                  <span className="text-gray-900">{selectedTask.assigneeName}</span>
                </div>
              )}
              {selectedTask.dueDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Due date</span>
                  <span className="text-gray-900">
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Comments section */}
            <CommentsSection taskId={selectedTask.id} />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedTask.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add task</h2>
            <form
              onSubmit={handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Task title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                  disabled={createMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {createMutation.isPending ? 'Adding...' : 'Add task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit project</h2>
            <form
              onSubmit={handleEditSubmit((data) => updateProjectMutation.mutate(data))}
              className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
                <input
                  {...registerEdit('name', { required: 'Project name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...registerEdit('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...registerEdit('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover image (optional)
                </label>
                {project?.imageUrl && !editImagePreview && (
                  <img
                    src={project.imageUrl}
                    alt="Current cover"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editImagePreview && (
                  <img
                    src={editImagePreview}
                    alt="New cover preview"
                    className="mt-3 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {updateProjectMutation.isPending ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsSection({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getAllForTask(taskId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.create(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.delete(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });

  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Comments</h3>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading comments...</p>
      ) : comments?.length === 0 ? (
        <p className="text-gray-400 text-sm mb-4">No comments yet</p>
      ) : (
        <div className="space-y-3 mb-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{comment.authorName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    className="text-xs text-red-400 hover:text-red-600">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && content.trim()) {
              createMutation.mutate({ content });
            }
          }}
        />
        <button
          onClick={() => {
            if (content.trim()) createMutation.mutate({ content });
          }}
          disabled={createMutation.isPending || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}
