import express from "express";
import { createProject } from "../controllers/project.controller";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/project", isAuthenticated, createProject);

export default router;
