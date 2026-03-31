"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh(); // Force a refresh to update session state in layouts
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white dark:bg-zinc-900 p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-scale-in transition-colors">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-foreground tracking-tight transition-colors">Bem-vindo(a) de volta!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium transition-colors">Faça login para continuar seu aprendizado.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-100 dark:border-red-500/20 animate-fade-in transition-colors">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 transition-colors">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 font-medium outline-none focus:border-primary transition-all bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 transition-colors">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 font-medium outline-none focus:border-primary transition-all bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900"
              placeholder="••••••"
            />
          </div>

          <Button type="submit" className="w-full h-14" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline transition-all">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
