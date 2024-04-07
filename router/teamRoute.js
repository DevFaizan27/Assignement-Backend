import express from 'express';
import { createTeam, getTeamById, getTeams } from '../controller/teamController.js';


const router=express.Router();


router.post('/create-team',createTeam);

router.get('/get-teams',getTeams);

router.get('/get-team/:id',getTeamById);


export default router;