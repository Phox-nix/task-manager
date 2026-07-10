'use client';

import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">TaskManager</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </button>
            <button
              onClick={() => router.push('/register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Project management made simple
        </div>
        <h1 className="text-5xl font-semibold text-gray-900 mb-6 leading-tight">
          Manage your projects
          <br />
          <span className="text-blue-600">and tasks in one place</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          TaskManager helps teams organize work, track progress, and collaborate — all with a clean,
          simple interface.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/register')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get started for free
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
            Sign in
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kanban boards</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Visualize your workflow with drag-and-drop Kanban boards. Move tasks from Todo to Done
              with ease.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Team collaboration</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Invite team members to your projects, assign tasks, and track progress together in
              real time.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task comments</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Keep all task discussions in one place with threaded comments directly on each task.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-gray-400">TaskManager</span>
          <span className="text-sm text-gray-400">Built with Next.js and ASP.NET</span>
        </div>
      </div>
    </div>
  );
}
