import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

const medicalChunks = [
  { englishText: "The patient is reporting sharp pain in the lower abdomen.", portugueseTranslation: "O paciente está relatando dor aguda na parte inferior do abdômen.", cefrLevel: "B2", theme: "Medicina", pack: "Medicina" },
  { englishText: "We need to monitor the vital signs every four hours.", portugueseTranslation: "Precisamos monitorar os sinais vitais a cada quatro horas.", cefrLevel: "B1", theme: "Medicina", pack: "Medicina" },
  { englishText: "The lab results confirm a bacterial infection.", portugueseTranslation: "Os resultados do laboratório confirmam uma infecção bacteriana.", cefrLevel: "B1", theme: "Medicina", pack: "Medicina" },
  { englishText: "Prescribe an antibiotic to be taken twice a day.", portugueseTranslation: "Prescreva um antibiótico para ser tomado duas vezes ao dia.", cefrLevel: "A2", theme: "Medicina", pack: "Medicina" },
  { englishText: "The surgical procedure was successful and without complications.", portugueseTranslation: "O procedimento cirúrgico foi bem-sucedido e sem complicações.", cefrLevel: "B2", theme: "Medicina", pack: "Medicina" },
  { englishText: "Please check the patient's medical history for any allergies.", portugueseTranslation: "Por favor, verifique o histórico médico do paciente para quaisquer alergias.", cefrLevel: "B1", theme: "Medicina", pack: "Medicina" },
  { englishText: "The recovery time for this type of injury is typically six weeks.", portugueseTranslation: "O tempo de recuperação para este tipo de lesão é de geralmente seis semanas.", cefrLevel: "B1", theme: "Medicina", pack: "Medicina" },
  { englishText: "The doctor is performing a physical examination now.", portugueseTranslation: "O médico está realizando um exame físico agora.", cefrLevel: "A1", theme: "Medicina", pack: "Medicina" },
  { englishText: "Apply a cold compress to reduce the swelling.", portugueseTranslation: "Aplique uma compressa fria para reduzir o inchaço.", cefrLevel: "A2", theme: "Medicina", pack: "Medicina" },
  { englishText: "The diagnosis suggests a chronic condition.", portugueseTranslation: "O diagnóstico sugere uma condição crônica.", cefrLevel: "C1", theme: "Medicina", pack: "Medicina" }
];

const techChunks = [
  { englishText: "We are about to deploy the latest version to the production server.", portugueseTranslation: "Estamos prestes a implantar a versão mais recente no servidor de produção.", cefrLevel: "B2", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "The database query needs to be optimized for better performance.", portugueseTranslation: "A consulta ao banco de dados precisa ser otimizada para melhor desempenho.", cefrLevel: "B1", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "I found a severe bug in the authentication module.", portugueseTranslation: "Encontrei um bug grave no módulo de autenticação.", cefrLevel: "B1", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "Let's perform a code review before merging the pull request.", portugueseTranslation: "Vamos realizar uma revisão de código antes de mesclar o pull request.", cefrLevel: "B2", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "The system architecture is based on microservices.", portugueseTranslation: "A arquitetura do sistema é baseada em microsserviços.", cefrLevel: "C1", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "Update the dependencies to resolve the security vulnerabilities.", portugueseTranslation: "Atualize as dependências para resolver as vulnerabilidades de segurança.", cefrLevel: "B1", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "The cloud infrastructure provides high availability and scalability.", portugueseTranslation: "A infraestrutura em nuvem oferece alta disponibilidade e escalabilidade.", cefrLevel: "C1", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "We should refactor this legacy code to improve readability.", portugueseTranslation: "Deveríamos refatorar este código legado para melhorar a legibilidade.", cefrLevel: "B2", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "The API documentation is available on the internal portal.", portugueseTranslation: "A documentação da API está disponível no portal interno.", cefrLevel: "A2", theme: "Tecnologia", pack: "Tecnologia" },
  { englishText: "Set up a proxy server to handle external requests.", portugueseTranslation: "Configure um servidor proxy para lidar com solicitações externas.", cefrLevel: "B1", theme: "Tecnologia", pack: "Tecnologia" }
];

async function updateContent() {
  console.log('🚀 Iniciando atualização de conteúdo dos packs...');
  
  try {
    // 1. Delete placeholders
    const deleted = await prisma.chunk.deleteMany({
      where: {
        OR: [
          { englishText: { contains: "Common Medicina expression" } },
          { englishText: { contains: "Common Tecnologia expression" } }
        ]
      }
    });
    console.log(`🗑️ Removidos ${deleted.count} placeholders genéricos.`);

    // 2. Insert Medical Chunks
    console.log('💊 Inserindo chunks de Medicina...');
    for (const chunk of medicalChunks) {
      await prisma.chunk.create({ data: chunk });
    }

    // 3. Insert Tech Chunks
    console.log('💻 Inserindo chunks de Tecnologia...');
    for (const chunk of techChunks) {
      await prisma.chunk.create({ data: chunk });
    }

    console.log('✅ Conteúdo atualizado com sucesso!');
  } catch (err) {
    console.error('❌ Erro na atualização:', err.message);
  }
}

updateContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
