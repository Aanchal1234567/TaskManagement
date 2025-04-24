import mongoose from "mongoose";

let taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, required: true },
  dueDate: { type: String, required: true },
  assignedTo: { type: String },
  tags: { type: [String] },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  referralId: { type: mongoose.Schema.Types.ObjectId, ref: "Signupdata" },
});

export default mongoose.model("Taskcontent", taskSchema);
