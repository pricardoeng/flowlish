"use server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import fs from "fs/promises"
import path from "path"

export async function registerUser(formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const imageFile = formData.get("image");

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

    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Ensure directory exists or let it create if missing
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const filePath = path.join(uploadsDir, `${user.id}.jpg`);
        await fs.writeFile(filePath, buffer);
      } catch (fsErr) {
        console.error("Failed to save image:", fsErr);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Erro interno do servidor." };
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function uploadProfilePicture(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    
    const imageFile = formData.get("image");
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "Nenhuma imagem enviada." };
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Save as [userId].jpg
    const filePath = path.join(uploadsDir, `${session.user.id}.jpg`);
    await fs.writeFile(filePath, buffer);

    return { success: true, avatarUrl: `/uploads/${session.user.id}.jpg?t=${Date.now()}` };
  } catch (error) {
    console.error("Upload Error:", error);
    return { success: false, error: "Falha no upload da foto." };
  }
}
