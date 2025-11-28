import getGeminiResponse from "../utils/gemini.js";
import Thread from "../models/thread.js";

export const getResponse=async(req,res)=>{
    const {threadId,message}=req.body;
    if(!threadId || !message){
        res.status(400).json({ error: "Thread ID and message are required." });
    }
    try{
         let thread=await Thread.findOne({ threadId });
         if(!thread){
        thread=new Thread({
            threadId,
            title:message,
            messages:[{role:"user", content: message}]
        });
         }else{
            thread.messages.push({ role: "user", content: message });
         }
        const assistantResponse= await getGeminiResponse(message);
        thread.messages.push({ role: "assistant", content: assistantResponse });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ reply:assistantResponse});

    }catch(error){
        console.error("Error in /chat route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
export const getThreads=async(req,res)=>{
    try{
        const threads = await Thread.find().sort({ updatedAt: -1 });  //descending order by updatedAt
        res.json(threads);

    }catch(error){
        console.error("Error in /thread route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
export const getParticularThread=async (req, res) => {
    try{
        const { threadId } = req.params;
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);

    }catch(error){
        console.error("Error in /thread/:threadId route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
export const deleteThread=async (req, res) => {
         try{
            const { threadId } = req.params;
            const result = await Thread.deleteOne({ threadId });
            if (!result) {
                return res.status(404).json({ error: "Thread not found" });
            }
            res.status(200).json({ success: "Thread deleted successfully" });
         }catch(error){
            console.error("Error in /thread/:threadId route:", error);
            res.status(500).json({ error: "Internal Server Error" });
         }
}