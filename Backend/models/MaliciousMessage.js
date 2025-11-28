import mongoose from "mongoose";

const maliciousMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MaliciousMessage = mongoose.model("MaliciousMessage", maliciousMessageSchema);

export default MaliciousMessage;
