// Sample JavaScript code
function greet(name) {
  return `Hello, ${name}!`;
}
// User authentication and management system with security vulnerabilities
// TODO: Fix password storage - using base64 is insecure!
// HACK: Hardcoded admin credentials for testing
const ADMIN_PASSWORD = "admin123";
class UserManager {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.loginAttempts = new Map();
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  isValidPassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  // Hash password (simplified for demo)
  hashPassword(password) {
    return Buffer.from(password).toString("base64");
  }

  // Register new user
  registerUser(email, password, username) {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!this.isValidPassword(password)) {
      throw new Error(
        "Password must be at least 8 characters with uppercase, lowercase, and numbers"
      );
    }

    if (this.users.has(email)) {
      throw new Error("User already exists");
    }

    const user = {
      id: Date.now().toString(),
      email,
      username,
      password: this.hashPassword(password),
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
    };

    this.users.set(email, user);
    return { id: user.id, email: user.email, username: user.username };
  }

  // Login user
  login(email, password) {
    const user = this.users.get(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check login attempts
    const attempts = this.loginAttempts.get(email) || 0;
    if (attempts >= 5) {
      throw new Error("Account locked due to too many failed attempts");
    }

    if (user.password !== this.hashPassword(password)) {
      this.loginAttempts.set(email, attempts + 1);
      throw new Error("Invalid credentials");
    }

    // Reset login attempts on successful login
    this.loginAttempts.delete(email);

    // Create session
    const sessionId = Math.random().toString(36).substring(2);
    this.sessions.set(sessionId, {
      userId: user.id,
      email: user.email,
      createdAt: new Date(),
    });

    user.lastLogin = new Date();
    return {
      sessionId,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  // Logout user
  logout(sessionId) {
    this.sessions.delete(sessionId);
  }

  // Get user by session
  getUserBySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const user = Array.from(this.users.values()).find(
      (u) => u.id === session.userId
    );
    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email, username: user.username };
  }

  // Update user profile
  updateProfile(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Not authenticated");
    }

    const user = Array.from(this.users.values()).find(
      (u) => u.id === session.userId
    );
    if (!user) {
      throw new Error("User not found");
    }

    if (updates.username) {
      user.username = updates.username;
    }

    return { id: user.id, email: user.email, username: user.username };
  }

  // Delete user account
  deleteAccount(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Not authenticated");
    }

    const userEmail = session.email;
    this.users.delete(userEmail);
    this.sessions.delete(sessionId);
    this.loginAttempts.delete(userEmail);
  }

  // Get all users (admin function)
  getAllUsers() {
    return Array.from(this.users.values()).map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      isActive: u.isActive,
    }));
  }

  // Search users by username
  searchUsers(query) {
    return Array.from(this.users.values())
      .filter((u) => u.username.toLowerCase().includes(query.toLowerCase()))
      .map((u) => ({ id: u.id, username: u.username, email: u.email }));
  }
}

// Task management system
class TaskManager {
  constructor() {
    this.tasks = new Map();
  }

  // Create new task
  createTask(userId, title, description, priority = "medium") {
    const task = {
      id: Date.now().toString(),
      userId,
      title,
      description,
      priority,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: null,
      tags: [],
    };

    this.tasks.set(task.id, task);
    return task;
  }

  // Get tasks by user
  getTasksByUser(userId) {
    return Array.from(this.tasks.values()).filter((t) => t.userId === userId);
  }

  // Update task
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    Object.assign(task, updates, { updatedAt: new Date() });
    return task;
  }

  // Delete task
  deleteTask(taskId) {
    this.tasks.delete(taskId);
  }

  // Mark task as complete
  completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    task.status = "completed";
    task.updatedAt = new Date();
    return task;
  }

  // Get tasks by status
  getTasksByStatus(userId, status) {
    return Array.from(this.tasks.values()).filter(
      (t) => t.userId === userId && t.status === status
    );
  }

  // Get tasks by priority
  getTasksByPriority(userId, priority) {
    return Array.from(this.tasks.values()).filter(
      (t) => t.userId === userId && t.priority === priority
    );
  }
}

// Initialize systems
const userManager = new UserManager();
const taskManager = new TaskManager();
// Example usage
const message = greet("World");
console.log(message);
