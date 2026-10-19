const ApiError = require("../utils/apiError");

// Seed initial users
let users = [
  {
    id: 1,
    name: "Aftab Farhan",
    email: "farhan@example.com",
    role: "admin",
    status: "active",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Rahim Ahmed",
    email: "rahim@example.com",
    role: "user",
    status: "active",
    createdAt: "2026-01-15T11:30:00.000Z",
    updatedAt: "2026-01-15T11:30:00.000Z",
  },
  {
    id: 3,
    name: "Karim Ullah",
    email: "karim@example.com",
    role: "user",
    status: "active",
    createdAt: "2026-02-01T09:15:00.000Z",
    updatedAt: "2026-02-01T09:15:00.000Z",
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    role: "editor",
    status: "active",
    createdAt: "2026-02-20T14:45:00.000Z",
    updatedAt: "2026-02-20T14:45:00.000Z",
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["admin", "editor", "user"];

/**
 * Get all users with query filtering, searching, sorting and pagination
 */
const getAllUsers = ({
  search = "",
  role = "",
  status = "",
  page = 1,
  limit = 10,
  sortBy = "id",
  sortOrder = "asc",
} = {}) => {
  let filtered = [...users];

  // Search filter
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }

  // Role filter
  if (role && role.trim()) {
    const r = role.trim().toLowerCase();
    filtered = filtered.filter((u) => u.role.toLowerCase() === r);
  }

  // Status filter
  if (status && status.trim()) {
    const s = status.trim().toLowerCase();
    filtered = filtered.filter((u) => (u.status || "active").toLowerCase() === s);
  }

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "desc" ? 1 : -1;
    if (valA > valB) return sortOrder === "desc" ? -1 : 1;
    return 0;
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedUsers = filtered.slice(startIndex, startIndex + limitNum);

  return {
    users: paginatedUsers,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Get single user by ID
 */
const getUserById = (id) => {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    throw ApiError.badRequest("Invalid user ID parameter. ID must be a number.");
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw ApiError.notFound(`User with ID ${userId} not found.`);
  }

  return user;
};

/**
 * Create a new user
 */
const createUser = ({ name, email, role = "user", status = "active" }) => {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long.");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  const normalizedRole = (role || "user").toLowerCase();
  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    errors.push(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Validation failed", errors);
  }

  const trimmedEmail = email.trim().toLowerCase();
  const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (existingUser) {
    throw ApiError.conflict(`A user with email '${trimmedEmail}' already exists.`);
  }

  const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newUser = {
    id: newId,
    name: name.trim(),
    email: trimmedEmail,
    role: normalizedRole,
    status: status === "inactive" ? "inactive" : "active",
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  return newUser;
};

/**
 * Update an existing user
 */
const updateUser = (id, { name, email, role, status }) => {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    throw ApiError.badRequest("Invalid user ID parameter.");
  }

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw ApiError.notFound(`User with ID ${userId} not found.`);
  }

  const errors = [];

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long.");
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      errors.push("A valid email address is required.");
    } else {
      const trimmedEmail = email.trim().toLowerCase();
      const duplicate = users.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.id !== userId
      );
      if (duplicate) {
        throw ApiError.conflict(`Email '${trimmedEmail}' is already in use by another user.`);
      }
    }
  }

  let normalizedRole;
  if (role !== undefined) {
    normalizedRole = role.toLowerCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      errors.push(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Validation failed", errors);
  }

  const currentUser = users[userIndex];
  users[userIndex] = {
    ...currentUser,
    ...(name !== undefined && { name: name.trim() }),
    ...(email !== undefined && { email: email.trim().toLowerCase() }),
    ...(normalizedRole !== undefined && { role: normalizedRole }),
    ...(status !== undefined && { status: status === "inactive" ? "inactive" : "active" }),
    updatedAt: new Date().toISOString(),
  };

  return users[userIndex];
};

/**
 * Delete a user by ID
 */
const deleteUser = (id) => {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    throw ApiError.badRequest("Invalid user ID parameter.");
  }

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw ApiError.notFound(`User with ID ${userId} not found.`);
  }

  const [deletedUser] = users.splice(userIndex, 1);
  return deletedUser;
};

/**
 * Get aggregated statistics about users
 */
const getUserStats = () => {
  const total = users.length;
  const roleBreakdown = {
    admin: 0,
    editor: 0,
    user: 0,
  };

  users.forEach((u) => {
    if (roleBreakdown[u.role] !== undefined) {
      roleBreakdown[u.role]++;
    } else {
      roleBreakdown[u.role] = 1;
    }
  });

  const activeCount = users.filter((u) => u.status === "active").length;
  const latestUser = users.length ? users[users.length - 1] : null;

  return {
    total,
    activeCount,
    inactiveCount: total - activeCount,
    roleBreakdown,
    latestUser,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
