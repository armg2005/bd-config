import express from "express";
import * as subjectController from "../controllers/subjectController.js";

const router = express.Router();

// Rotas para /subjects

// Criar matéria
router.post("/", subjectController.create);

// Listar todas as matérias
router.get("/", subjectController.getAll);

// Buscar matéria por ID
router.get("/:id", subjectController.getById);

// Atualizar matéria
router.patch("/:id", subjectController.update);

// Excluir matéria
router.delete("/:id", subjectController.remove);

export default router;
