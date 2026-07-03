// Auth
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

// Projects
export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
  status: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  memberCount: number;
}

// Tasks
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
}

// Members
export interface AddMemberRequest {
  email: string;
}

export interface MemberResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  joinedAt: string;
}

// Comments
export interface CreateCommentRequest {
  content: string;
}

export interface CommentResponse {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
