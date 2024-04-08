import { UserModel } from "../model/usermodel.js";
import { getDataUri } from "../utils/getDataUri.js";
import cloudinary from "cloudinary";

//controller to add user
export const addUser = async (req, res) => {
    try {
        const file = getDataUri(req.file);
        const { first_name, last_name, email, gender, domain, available } = req.body;

        // Check if any required field is missing
        if (!first_name || !last_name || !email || !gender || !domain || !available || !file) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }

        // Upload image to Cloudinary and create user if all fields are present
        const myCloud = await cloudinary.v2.uploader.upload(file.content, {
            folder: "Assignment/avatar-images",
        });
        
        const image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };

        await UserModel.create({
            first_name,
            last_name,
            email,
            gender,
            domain,
            available,
            avatar: image,
        });

        return res.status(200).json({ message: "User added successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


//controlller to get user
export const getUsers = async (req, res) => {
    try {
        
        const { search, page = 1, limit = 10, domain, gender, available } = req.query;
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search regex

        const filter = {};
        if (domain) filter.domain = domain;
        if (gender) filter.gender = gender;
        if (available !== undefined) filter.available = available;

        // Retrieve all unique domains from the database
        const allDomains = await UserModel.distinct('domain');
        

        const totalUsers = await UserModel.countDocuments({
            $and: [
                filter,
                {
                    $or: [
                        { first_name: searchRegex },
                        { last_name: searchRegex }
                    ]
                }
            ]
        });

        const users = await UserModel.find({
            $and: [
                filter,
                {
                    $or: [
                        { first_name: searchRegex },
                        { last_name: searchRegex }
                    ]
                }
            ]
        })
        .skip((page - 1) * limit)
        .limit(limit);

        return res.status(200).json({ users, totalUsers ,allDomains});
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



// controller to get user by id

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        return res.status(201).json({ user: user });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//controller to delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await cloudinary.uploader.destroy(user.avatar.public_id);
        await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "removed user successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// controller to update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, gender, domain, available } = req.body;
        const file = req.file;

        // Check if a new avatar file is uploaded
        if (file) {
            const fileDataUri = getDataUri(file);
            const myCloud = await cloudinary.v2.uploader.upload(fileDataUri.content, {
                folder: "Assignment/avatar-images",
            });
            const image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };

            // Delete the old avatar from Cloudinary if updating
            const user = await UserModel.findById(id);
            if (user.avatar && user.avatar.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }

            // Update user data including avatar in MongoDB
            await UserModel.findByIdAndUpdate(id, {
                first_name,
                last_name,
                email,
                gender,
                domain,
                available,
                avatar: image,
            });
        } else {
            // If no new image is uploaded, update user data excluding avatar in MongoDB
            await UserModel.findByIdAndUpdate(id, {
                first_name,
                last_name,
                email,
                gender,
                domain,
                available,
            });
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

