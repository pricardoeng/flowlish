"use server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(data) {
  try {
    const { name, email, password } = data;

    if (!email || !password || !name) {
      return { success: false, error: "Preencha todos os campos." };
    }

    if (password.length < 6) {
      return { success: false, error: "A senha precisa ter pelo menos 6 caracteres." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Este email já está cadastrado." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        goal: "Fluency",
        currentLevel: "A1"
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Erro interno do servidor." };
  }
}
