const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deleteUser,
  createUser,
  updateUser,
} = require("../controllers/userControllers");

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id',  updateUser);
router.delete('/:id',  deleteUser);


module.exports = router;
