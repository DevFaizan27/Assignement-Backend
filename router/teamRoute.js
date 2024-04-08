import express from 'express';
import { createTeam, getTeamById, getTeams } from '../controller/teamController.js';
import singleUpload from '../middleware/singleUpload.js';



const router=express.Router();


router.post('/create-team',singleUpload,createTeam);

router.get('/get-teams',getTeams);

router.get('/get-team/:id',getTeamById);


export default router;