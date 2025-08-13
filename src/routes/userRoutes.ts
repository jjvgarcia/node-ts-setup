import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

// User CRUD routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
