import prisma from "./src/config/database.js";

async function main() {
  console.log("Criando dados...");

  const user = await prisma.user.create({
    data: {
      nome: "Professor Teste",
      email: "professor@ifnmg.edu.br",
    }
  });

  const subject = await prisma.subject.create({
    data: {
      nome: "Desenvolvimento Web II",
      professorId: user.id
    }
  });

  const question = await prisma.question.create({
    data: {
      enunciado: "O que é um ORM?",
      dificuldade: 2,
      respostaCorreta: "Object-Relational Mapping",
      disciplinaId: subject.id,
      autorId: user.id
    }
  });

  console.log("✅ Dados criados com sucesso!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());