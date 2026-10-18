// Mock Data
let users = [
  { id: 1, name: 'Aftab Farhan', email: 'farhan@example.com', role: 'admin' },
  { id: 2, name: 'Rahim Ahmed', email: 'rahim@example.com', role: 'user' },
  { id: 3, name: 'Karim Ullah', email: 'karim@example.com', role: 'user' },
  { id: 4, name: 'Nusrat Jahan', email: 'nusrat@example.com', role: 'editor' }
];

// GET all users
const getAllUsers = (req, res) => {
  res.status(200).json({
    success: true,
    total: users.length,
    data: users
  });
};

// GET user by ID
const getUserById = (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
};

// POST create new user
const createUser = (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    role: role || 'user'
  };

  users.push(newUser);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
};

// PUT update user by ID
const updateUser = (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { name, email, role } = req.body;

  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role })
  };

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: users[userIndex]
  });
};

// DELETE user by ID
const deleteUser = (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const deletedUser = users.splice(userIndex, 1);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: deletedUser[0]
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

