import axios from "axios";
import MaliciousMessage from "../models/MaliciousMessage.js";

export const checkMaliciousContent = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Call the Flask BERT API
    const response = await axios.post(
      "http://127.0.0.1:5002/predict",
      { text: message },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;
    console.log("Flask API response:", data);

    const { decision, label, confidence } = data;

    const maliciousCategories = ["bypass", "phishing", "injection", "jailbreak"];

    // If malicious and in relevant category
    if (decision === "malicious" && maliciousCategories.includes(label.toLowerCase())) {
      // Save to MongoDB
      const record = new MaliciousMessage({ message, category: label, confidence });
      await record.save();
      console.log("⚠️ Malicious message logged to DB:", record);

      return res.json({
        alert: true,
        message: "Sorry, we can't provide assistance with potentially harmful or malicious use cases.",
      
        confidence,
      });
    }
   
    next();

  } catch (err) {
    console.error("Error contacting Flask API:", err.message);
    return res.status(500).json({ error: "Error analyzing message content" });
  }
};

//  category: label,