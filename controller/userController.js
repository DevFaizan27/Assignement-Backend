import { UserModel } from "../model/usermodel.js";
import { getDataUri } from "../utils/getDataUri.js";
import cloudinary from "cloudinary";

//controller to add user
export const addUser = async (req, res) => {
    try {
        const file = getDataUri(req.file);
        // console.log(req.files);

        const { first_name, last_name, email, gender, domain, available } =req.body;

        console.log(first_name);

        const myCloud = await cloudinary.v2.uploader.upload(file.content, {
            folder: "Assignment/avatar-images",
        });

        const image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };

        if (
            !first_name ||
            !last_name ||
            !email ||
            !gender ||
            !domain ||
            !available ||
            !image
        ) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }

        await UserModel.create({
            first_name,
            last_name,
            email,
            gender,
            domain,
            available,
            avatar: image,
        });
        res.status(200).json({ message: "User Added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//controller to get users
// export const getUsers = async (req, res) => {
//     try {
//         const users = await UserModel.find();
//         res.status(201).json({ users: users });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
export const getUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 20, domain, gender, available } = req.query;
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search regex

        const filter = {};
        if (domain) filter.domain = domain;
        if (gender) filter.gender = gender;
        if (available !== undefined) filter.available = available;

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

        res.status(200).json({count:users.length, users: users });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


//controller to get user by id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        console.log(user);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        res.status(201).json({ user: user });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//controller to delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const user = await UserModel.findById(id);
        console.log(user.avatar.public_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await cloudinary.uploader.destroy(user.avatar.public_id);
        await UserModel.findByIdAndDelete(id);
        res.status(200).json({ message: "removed user successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//controller to update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, gender, domain, available } =req.body;
        const file = req.file;

        // Check if a new avatar file is uploaded

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

        // Update user data in MongoDB
        await UserModel.findByIdAndUpdate(id, {
            first_name,
            last_name,
            email,
            gender,
            domain,
            available,
            avatar: image,
        });

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
