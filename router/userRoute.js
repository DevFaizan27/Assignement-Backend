import express from 'express';
import { addUser, deleteUser, getUserById, getUsers, updateUser } from '../controller/userController.js';
import singleUpload from '../middleware/singleUpload.js';
const router=express.Router();

//route to add user
router.post('/add-user',singleUpload,addUser);

//route to get all users
router.get('/get-users',getUsers);

//route to  user by id
router.get('/get-user-by-id/:id',getUserById);

//route to update user
router.put('/update-user/:id',singleUpload,updateUser);

//route to delete user
router.delete('/delete-user/:id',deleteUser);



export default router;