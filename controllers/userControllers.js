const userService = require("../services/userservices");
const ApiResponse = require("../utils/apiResponse");

/**
 * GET /api/users
 * Supports query parameters: search, role, status, page, limit, sortBy, sortOrder
 */
const getAllUsers = (req, res, next) => {
  try {
    const { search, role, status, page, limit, sortBy, sortOrder } = req.query;
    const result = userService.getAllUsers({
      search,
      role,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Users retrieved successfully",
      data: result.users,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User details retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 */
const createUser = (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    const newUser = userService.createUser({ name, email, role, status });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    const updatedUser = userService.updateUser(req.params.id, {
      name,
      email,
      role,
      status,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = (req, res, next) => {
  try {
    const deletedUser = userService.deleteUser(req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats
 */
const getUserStats = (req, res, next) => {
  try {
    const stats = userService.getUserStats();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
