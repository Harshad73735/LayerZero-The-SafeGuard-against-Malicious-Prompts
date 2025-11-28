import express from "express";
const router =express.Router();
import { getResponse,getThreads,getParticularThread,deleteThread } from "../controllers/chatController.js";
import { checkMaliciousContent } from "../Middleware/maliciousContentMiddleware.js";


router.get("/thread",getThreads);
router.get("/thread/:threadId", getParticularThread);
router.delete("/thread/:threadId", deleteThread);

router.post("/chat",checkMaliciousContent,getResponse);

export default router;