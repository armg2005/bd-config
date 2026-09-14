import express from "express";
import * as questionController from "../controllers/questionController.js";

const router = express.Router();

// Rotas para /questions

// Criar questão
router.post("/", questionController.create);

// Listar todas as questões
router.get("/", questionController.getAll);

// Buscar questão por ID
router.get("/:id", questionController.getById);

// Atualizar questão
router.patch("/:id", questionController.update);

// Excluir questão
router.delete("/:id", questionController.remove);

export default router;
