import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import Taskcontent from "./Module/Taskcontent.js";
import Signupdata from "./Module/Signupdata.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/textocontent").then(() => {
    console.log("connected");
});

app.get("/", (req, res) => {
    res.send("Hi");
});

// Get tasks by referralId
app.get("/textscontent/:id", async (req, res) => {
    try {
        const referralId = req.params.id;
        const texts = await Taskcontent.find({ referralId });
        res.json(texts);
    } catch (error) {
        console.error("Backend error:", error);
        res.status(500).json({ error: "Error fetching tasks: " + error.message });
    }
});

// Create a task
app.post("/textscontent", async (req, res) => {
    const { title, description, priority, dueDate, assignedTo, tags, referralId } = req.body;
    const task = new Taskcontent({ title, description, priority, dueDate, assignedTo, tags, referralId });
    await task.save();
    res.json(task);
});

// Sign up user with bcrypt
app.post("/SignUp", async (req, res) => {
    const { fullName, username, password } = req.body;

    // Check if the username already exists
    const existingUser = await Signupdata.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const signup = new Signupdata({ fullName, username, password: hashedPassword });
    await signup.save();
    res.json(signup);
});

// Fetch all signups
app.get("/SignUp", async (req, res) => {
    res.json({
        texts: await Signupdata.find()
    });
});

// Sign in user with bcrypt
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    const user = await Signupdata.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: "Invalid username" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
        message: "Logged in successfully",
        user
    });
});

// Update user profile with bcrypt
app.put("/updateUser/:id", async (req, res) => {
    try {
        const { fullName, username, currentPassword, newPassword } = req.body;
        const userId = req.params.id;

        // Find the user
        const user = await Signupdata.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Check if new username already exists
        if (username !== user.username) {
            const existingUser = await Signupdata.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        // Update user data
        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Error updating profile: " + error.message });
    }
});

// Update a task
app.put("/textscontent/:id", async (req, res) => {
    const { title, description, priority, dueDate, assignedTo, tags, status, referralId } = req.body;
    const ID = req.params.id;
    const task = await Taskcontent.findByIdAndUpdate(
        ID,
        { title, description, priority, dueDate, assignedTo, tags, status, referralId },
        { new: true }
    );
    res.json(task);
});

// Delete a task
app.delete("/textscontent/:id", async (req, res) => {
    const ID = req.params.id;
    await Taskcontent.findByIdAndDelete(ID);
    res.send("Task deleted successfully");
});

// Start the server
app.listen(5500, () => {
    console.log("Server running on port 5500");
});
