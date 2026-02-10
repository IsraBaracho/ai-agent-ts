import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Message, Tool, ToolResult, AgentConfig } from '../types';

export class Agent {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private tools: Tool[];
    private conversationHistory: Message[];
    private config: AgentConfig;

    constructor(apiKey: string, tools: Tool[], config: AgentConfig = {}) {
        // Inicializa o cliente do Gemini
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Configurações padrão
        this.config = {
        model: config.model || 'gemini-3-flash-preview', // Modelo gratuito e rápido
        maxIterations: config.maxIterations || 10,
        temperature: config.temperature || 0.7,
        };

        // Inicializa o modelo com as ferramentas
        this.model = this.genAI.getGenerativeModel({
        model: this.config.model!,
        tools: this.convertToolsToGeminiFormat(tools),
        });

        this.tools = tools;
        this.conversationHistory = [];
    }

    /**
     * Converte nossas ferramentas para o formato que o Gemini entende
    */
    private convertToolsToGeminiFormat(tools: Tool[]) {
    return [
        {
        functionDeclarations: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: {
            type: SchemaType.OBJECT,  // ✅ Agora sim o tipo correto!
            properties: tool.parameters.properties || {},
            required: tool.parameters.required || [],
            },
        })),
        },
    ];
    }

    /**
     * Executa uma ferramenta pelo nome
     */
    private async executeTool(toolName: string, args: any): Promise<ToolResult> {
        const tool = this.tools.find((t) => t.name === toolName);

        if (!tool) {
        return {
            toolName,
            result: null,
            error: `Ferramenta "${toolName}" não encontrada`,
        };
        }

        try {
        const result = await tool.execute(args);
        return {
            toolName,
            result,
        };
        } catch (error) {
        return {
            toolName,
            result: null,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
        }
    }

    /**
 * Processa uma mensagem do usuário e retorna a resposta
 */
async processMessage(userMessage: string): Promise<string> {
  console.log('\n🤔 Usuário:', userMessage);

  // Adiciona a mensagem do usuário ao histórico
  this.conversationHistory.push({
    role: 'user',
    content: userMessage,
  });

  // Inicia o chat com histórico
  const chat = this.model.startChat({
    history: this.conversationHistory.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  let iteration = 0;
  let finalResponse = '';

  // Loop do agente: pensa -> age -> repete até ter a resposta final
  while (iteration < this.config.maxIterations!) {
    iteration++;
    console.log(`\n🔄 Iteração ${iteration}/${this.config.maxIterations}`);

    // Envia a mensagem e recebe a resposta
    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    // Verifica se o modelo quer usar alguma ferramenta
    const functionCalls = response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      // Não há mais ferramentas para usar, temos a resposta final!
      const text = response.text();
      if (text && text.trim()) {
        finalResponse = text;
        console.log('✅ Resposta final gerada');
      }
      break;
    }

    // O modelo quer usar ferramentas!
    console.log(`🔧 Modelo quer usar ${functionCalls.length} ferramenta(s)`);

    // Executa cada ferramenta solicitada
    const functionResponses = [];
    for (const functionCall of functionCalls) {
      console.log(`  → Executando: ${functionCall.name}`);
      console.log(`  → Argumentos:`, functionCall.args);

      const toolResult = await this.executeTool(
        functionCall.name,
        functionCall.args
      );

      if (toolResult.error) {
        console.log(`  ❌ Erro: ${toolResult.error}`);
      } else {
        console.log(`  ✓ Resultado:`, toolResult.result);
      }

      functionResponses.push({
        functionResponse: {
            name: functionCall.name,
            response: {
            content: String(toolResult.result),  // Converte para string dentro de um objeto
            },
        },
        });
    }

    // Envia os resultados das ferramentas de volta para o modelo
    // e continua o loop para pegar a resposta final
    const nextResult = await chat.sendMessage(functionResponses);
    
    // Verifica se já temos a resposta final
    const nextResponse = nextResult.response;
    const nextText = nextResponse.text();
    
    if (nextText && nextText.trim() && !nextResponse.functionCalls()) {
      finalResponse = nextText;
      console.log('✅ Resposta final gerada após usar ferramentas');
      break;
    }
  }

  if (!finalResponse || !finalResponse.trim()) {
    finalResponse = 'Desculpe, não consegui completar a tarefa no limite de iterações.';
  }

  // Adiciona a resposta do assistente ao histórico
  this.conversationHistory.push({
    role: 'assistant',
    content: finalResponse,
  });

  return finalResponse;
}

    /**
     * Reseta o histórico da conversa
     */
    resetConversation() {
        this.conversationHistory = [];
        console.log('🔄 Histórico de conversa resetado');
    }

    /**
     * Retorna o histórico da conversa
     */
    getHistory(): Message[] {
        return [...this.conversationHistory];
    }
}
