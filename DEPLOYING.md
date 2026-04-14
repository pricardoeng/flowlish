# Guia de Implantação em Produção 🚀

O Flowlish está agora preparado para ser lançado em um ambiente real. Siga estes passos para colocar o site no ar:

## 1. Escolha da Hospedagem
Recomendamos a **Vercel** pela integração nativa com Next.js 15.
- Conecte seu repositório GitHub à Vercel.
- O build command será `npm run build` (já configurado para gerar o Prisma Client).

## 2. Banco de Dados (PostgreSQL)
Para produção, o SQLite (`dev.db`) não é recomendado. Use um serviço como **Supabase**, **Neon** ou **Vercel Postgres**.

**Passos para migrar:**
1. Crie um banco de dados Postgres e obtenha a `DATABASE_URL`.
2. No arquivo `prisma/schema.prisma`, altere o `provider` de `"sqlite"` para `"postgresql"`.
3. Rode `npx prisma migrate dev` localmente apontando para o seu banco de produção para criar as tabelas.
4. Rode `npx prisma db seed` para preencher os conteúdos (opcional).

## 3. Variáveis de Ambiente
Configure as seguintes variáveis no painel da sua hospedagem:

| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | URL de conexão com o Postgres. |
| `NEXTAUTH_URL` | A URL final do seu site (ex: `https://seu-app.vercel.app`). |
| `NEXTAUTH_SECRET` | Uma chave aleatória (gere com `openssl rand -base64 32`). |
| `NEXT_PUBLIC_DAILY_DOMAIN` | Seu subdomínio da Daily.co. |
| `DAILY_API_KEY` | Sua chave de API da Daily.co. |

## 4. Checklist de Segurança ✅
- [ ] Verifique se o `NEXTAUTH_SECRET` é complexo em produção.
- [ ] Garanta que `NODE_ENV` está definido como `production`.
- [ ] Confirme se as rotas de API estão protegidas (já implementado conforme plano).

---
**Boa sorte com o lançamento!** Se precisar de ajustes específicos para um provedor diferente, estou à disposição.
