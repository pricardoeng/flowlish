"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { Camera } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const { success, error: serverError } = await registerUser(formData);

    if (!success) {
      setError(serverError);
      setLoading(false);
      return;
    }

    // Auto-login after successful registration
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError("Conta criada, mas erro ao logar automaticamente.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl animate-scale-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Criar Conta</h2>
          <p className="text-zinc-500 font-medium">Comece sua jornada de aprendizado grátis.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-fade-in">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="relative h-24 w-24 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group shadow-sm"
              onClick={() => document.getElementById('avatarUpload').click()}
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Camera size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Foto</span>
                </div>
              )}
            </div>
            <input 
              id="avatarUpload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  setImagePreview(URL.createObjectURL(e.target.files[0]));
                }
              }} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest uppercase text-zinc-400">Nome Mágico</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 p-4 font-medium outline-none focus:border-primary transition-all bg-zinc-50 focus:bg-white"
              placeholder="Como quer ser chamado?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest uppercase text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 p-4 font-medium outline-none focus:border-primary transition-all bg-zinc-50 focus:bg-white"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest uppercase text-zinc-400">Criar Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 p-4 font-medium outline-none focus:border-primary transition-all bg-zinc-50 focus:bg-white"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <Button type="submit" className="w-full h-14" disabled={loading}>
            {loading ? "Processando..." : "Começar Agora 🚀"}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-zinc-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline transition-all">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
