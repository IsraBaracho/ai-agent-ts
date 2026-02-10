// src/types/index.ts

import { z } from 'zod';

// Schema para validar mensagens
export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

// Definição de ferramenta (sem usar Zod para a função execute)
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: any) => Promise<any>;
}

// Resultado da execução de uma ferramenta
export interface ToolResult {
  toolName: string;
  result: any;
  error?: string;
}

// Configuração do agente
export interface AgentConfig {
  model?: string;
  maxIterations?: number;
  temperature?: number;
}