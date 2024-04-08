import { TeamModel } from "../model/teamModel.js";
import { UserModel } from "../model/usermodel.js";

//controller to craete the team
export const createTeam = async (req, res) => {
    const { domain, available } = req.body;
    try {
        if(!domain || !available){
            return res.status(400).json({ error: 'Domain and availability are required' });
        }
        const users = await UserModel.find({ domain, available });

        if (!users || users.length === 0) {
            return res.status(400).json({ error: 'No users found with the specified domain and availability' });
        }

        await TeamModel.create({
            domain,
            users,
            available,
        })

        return res.status(201).json({ message: "Team Create Successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

//controller to get all the teams
export const getTeams = async (req, res) => {
    try {
        const teams = await TeamModel.find();
        return res.status(201).json({ teams });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

//controller to get the team by id
export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await TeamModel.findById(id);
        return res.status(201).json({ team });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}