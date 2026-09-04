// src/routes/subjectRoutes.js
import express from "express";
import * as subjectController from "../controllers/subjectController.js";

const router = express.Router();

/**
 * Rotas de Matérias
 * Base URL: /subjects
 */

// CREATE - Criar nova matéria
router.post("/", subjectController.create);

// READ - Listar todas as matérias
router.get("/", subjectController.getAll);

// READ - Buscar matéria por ID
router.get("/:id", subjectController.getById);

export default router;