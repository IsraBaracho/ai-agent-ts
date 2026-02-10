import 'dotenv/config'; // Carrega as variáveis do .env
import { Agent } from './agent/agent';
import { availableTools } from './agent/tools';
import * as readline from 'readline';

// Verifica se a API key está configurada
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Erro: GEMINI_API_KEY não encontrada no arquivo .env');
    process.exit(1);
}

const validApiKey: string = apiKey;

// Cria uma interface para ler input do terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Função auxiliar para fazer perguntas no terminal
function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Função principal
async function main() {
    console.log('🤖 Iniciando Agente de IA...\n');

    // Cria o agente com as ferramentas disponíveis
    const agent = new Agent(validApiKey, availableTools, {
        model: 'gemini-3-flash-preview',
        maxIterations: 10,
        temperature: 0.7,
    });

    console.log('✅ Agente iniciado com sucesso!');
    console.log('📋 Ferramentas disponíveis:');
    availableTools.forEach((tool) => {
        console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('\n💡 Digite sua mensagem ou "sair" para encerrar\n');

    // Loop principal - fica esperando mensagens do usuário
    while (true) {
        const userInput = await question('Você: ');

        // Verifica se o usuário quer sair
        if (userInput.toLowerCase() === 'sair' || userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Encerrando agente. Até logo!');
        rl.close();
        break;
        }

        // Verifica se o usuário quer resetar a conversa
        if (userInput.toLowerCase() === 'reset') {
        agent.resetConversation();
        console.log('\n');
        continue;
        }

        // Ignora mensagens vazias
        if (!userInput.trim()) {
        continue;
        }

        try {
        // Processa a mensagem do usuário
        const response = await agent.processMessage(userInput);
        console.log('\n🤖 Agente:', response, '\n');
        } catch (error) {
        console.error('\n❌ Erro ao processar mensagem:', error);
        console.log('');
        }
    }
}

// Executa a função principal
main().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});