import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";

const createdUserIds = [];
const createdSubjectIds = [];
const createdQuestionIds = [];

function uniqueEmail(label) {
  return `aula05-${label}-${Date.now()}-${Math.random()}@example.com`;
}

async function createUser(overrides = {}) {
  const response = await request(app)
    .post("/users")
    .send({
      nome: "Prof. Teste",
      email: uniqueEmail("user"),
      ...overrides,
    });

  if (response.status === 201) {
    createdUserIds.push(response.body.data.id);
  }

  return response;
}

async function createSubject(professorId, overrides = {}) {
  const response = await request(app)
    .post("/subjects")
    .send({
      nome: "Matéria de Teste",
      professorId,
      ...overrides,
    });

  if (response.status === 201) {
    createdSubjectIds.push(response.body.data.id);
  }

  return response;
}

async function createQuestion(subjectId, authorId, overrides = {}) {
  const response = await request(app)
    .post("/questions")
    .send({
      enunciado: "Qual é a capital do Brasil?",
      dificuldade: 1,
      respostaCorreta: "Brasília",
      subjectId,
      authorId,
      ...overrides,
    });

  if (response.status === 201) {
    createdQuestionIds.push(response.body.data.id);
  }

  return response;
}

afterEach(async () => {
  if (createdQuestionIds.length > 0) {
    await prisma.question.deleteMany({
      where: {
        id: {
          in: createdQuestionIds.splice(0),
        },
      },
    });
  }

  if (createdSubjectIds.length > 0) {
    await prisma.subject.deleteMany({
      where: {
        id: {
          in: createdSubjectIds.splice(0),
        },
      },
    });
  }

  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: createdUserIds.splice(0),
        },
      },
    });
  }
});

describe("Subject API", () => {
  it("cria uma matéria", async () => {
    const user = await createUser();
    const professorId = user.body.data.id;

    const response = await createSubject(professorId);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nome).toBe("Matéria de Teste");
    expect(response.body.data.professorId).toBe(professorId);
  });

  it("lista matérias", async () => {
    const response = await request(app).get("/subjects");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBe(response.body.data.length);
  });

  it("busca matéria por ID e valida IDs inválidos", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const subjectId = subject.body.data.id;

    const found = await request(app).get(`/subjects/${subjectId}`);
    const invalid = await request(app).get("/subjects/abc");
    const missing = await request(app).get("/subjects/999999999");

    expect(found.status).toBe(200);
    expect(found.body.success).toBe(true);
    expect(found.body.data.id).toBe(subjectId);

    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("atualiza somente os campos enviados da matéria", async () => {
    const user = await createUser();

    const created = await createSubject(user.body.data.id, {
      nome: "Nome Original",
      ativa: true,
    });

    const subjectId = created.body.data.id;
    const originalProfessorId = created.body.data.professorId;

    const response = await request(app).patch(`/subjects/${subjectId}`).send({
      nome: "Nome Atualizado",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nome).toBe("Nome Atualizado");
    expect(response.body.data.ativa).toBe(true);
    expect(response.body.data.professorId).toBe(originalProfessorId);
  });

  it("rejeita PATCH de matéria vazio", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const response = await request(app)
      .patch(`/subjects/${subject.body.data.id}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("retorna 404 para professor inexistente ao criar matéria", async () => {
    const response = await request(app).post("/subjects").send({
      nome: "Matéria Inválida",
      professorId: 999999999,
    });

    expect(response.status).toBe(404);
  });

  it("retorna 404 para professor inexistente ao atualizar matéria", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const response = await request(app)
      .patch(`/subjects/${subject.body.data.id}`)
      .send({
        professorId: 999999999,
      });

    expect(response.status).toBe(404);
  });

  it("não permite excluir matéria que possui questão vinculada", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    expect(question.status).toBe(201);

    const response = await request(app).delete(
      `/subjects/${subject.body.data.id}`,
    );

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("exclui matéria sem questões vinculadas", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const subjectId = subject.body.data.id;

    const removed = await request(app).delete(`/subjects/${subjectId}`);
    const found = await request(app).get(`/subjects/${subjectId}`);

    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
    expect(found.status).toBe(404);

    const index = createdSubjectIds.indexOf(subjectId);

    if (index !== -1) {
      createdSubjectIds.splice(index, 1);
    }
  });
});

describe("Question API", () => {
  it("cria uma questão", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const response = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.enunciado).toBe("Qual é a capital do Brasil?");
    expect(response.body.data.dificuldade).toBe(1);
  });

  it("lista questões", async () => {
    const response = await request(app).get("/questions");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBe(response.body.data.length);
  });

  it("busca questão por ID e valida IDs inválidos", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const questionId = question.body.data.id;

    const found = await request(app).get(`/questions/${questionId}`);
    const invalid = await request(app).get("/questions/abc");
    const missing = await request(app).get("/questions/999999999");

    expect(found.status).toBe(200);
    expect(found.body.success).toBe(true);
    expect(found.body.data.id).toBe(questionId);

    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("atualiza somente os campos enviados da questão", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const created = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
      {
        enunciado: "Enunciado Original",
        dificuldade: 1,
        respostaCorreta: "Resposta Original",
        ativa: true,
      },
    );

    const questionId = created.body.data.id;
    const originalSubjectId = created.body.data.subjectId;
    const originalAuthorId = created.body.data.authorId;
    const originalResposta = created.body.data.respostaCorreta;

    const response = await request(app).patch(`/questions/${questionId}`).send({
      dificuldade: 3,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.dificuldade).toBe(3);
    expect(response.body.data.enunciado).toBe("Enunciado Original");
    expect(response.body.data.respostaCorreta).toBe(originalResposta);
    expect(response.body.data.subjectId).toBe(originalSubjectId);
    expect(response.body.data.authorId).toBe(originalAuthorId);
    expect(response.body.data.ativa).toBe(true);
  });

  it("permite remover resposta correta com null", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const response = await request(app)
      .patch(`/questions/${question.body.data.id}`)
      .send({
        respostaCorreta: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.respostaCorreta).toBeNull();
  });

  it("rejeita PATCH de questão vazio", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const response = await request(app)
      .patch(`/questions/${question.body.data.id}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("rejeita dificuldade inválida", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const response = await request(app)
      .patch(`/questions/${question.body.data.id}`)
      .send({
        dificuldade: 4,
      });

    expect(response.status).toBe(400);
  });

  it("retorna 404 para matéria inexistente ao criar questão", async () => {
    const user = await createUser();

    const response = await request(app).post("/questions").send({
      enunciado: "Questão inválida",
      dificuldade: 1,
      respostaCorreta: "Resposta",
      subjectId: 999999999,
      authorId: user.body.data.id,
    });

    expect(response.status).toBe(404);
  });

  it("retorna 404 para autor inexistente ao criar questão", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);

    const response = await request(app).post("/questions").send({
      enunciado: "Questão inválida",
      dificuldade: 1,
      respostaCorreta: "Resposta",
      subjectId: subject.body.data.id,
      authorId: 999999999,
    });

    expect(response.status).toBe(404);
  });

  it("retorna 404 para matéria inexistente ao atualizar questão", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const response = await request(app)
      .patch(`/questions/${question.body.data.id}`)
      .send({
        subjectId: 999999999,
      });

    expect(response.status).toBe(404);
  });

  it("retorna 404 para autor inexistente ao atualizar questão", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const response = await request(app)
      .patch(`/questions/${question.body.data.id}`)
      .send({
        authorId: 999999999,
      });

    expect(response.status).toBe(404);
  });

  it("exclui questão e retorna 404 na busca posterior", async () => {
    const user = await createUser();
    const subject = await createSubject(user.body.data.id);
    const question = await createQuestion(
      subject.body.data.id,
      user.body.data.id,
    );

    const questionId = question.body.data.id;

    const removed = await request(app).delete(`/questions/${questionId}`);
    const found = await request(app).get(`/questions/${questionId}`);

    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
    expect(found.status).toBe(404);

    const index = createdQuestionIds.indexOf(questionId);

    if (index !== -1) {
      createdQuestionIds.splice(index, 1);
    }
  });

  it("valida ID inválido ao excluir questão", async () => {
    const response = await request(app).delete("/questions/abc");

    expect(response.status).toBe(400);
  });

  it("valida ID inválido ao excluir matéria", async () => {
    const response = await request(app).delete("/subjects/abc");

    expect(response.status).toBe(400);
  });
});
