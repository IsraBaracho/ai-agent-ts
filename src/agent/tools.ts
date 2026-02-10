import type { Tool } from '../types';

/**
 * Ferramenta para calcular operações matemáticas simples
 */
export const calculatorTool: Tool = {
    name: 'calculator',
    description: 'Executa cálculos matemáticos básicos. Use quando precisar fazer contas.',
    parameters: {
        type: 'object',
        properties: {
        operation: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide'],
            description: 'A operação matemática a realizar',
        },
        a: {
            type: 'number',
            description: 'Primeiro número',
        },
        b: {
            type: 'number',
            description: 'Segundo número',
        },
        },
        required: ['operation', 'a', 'b'],
    },
    execute: async ({ operation, a, b }: { operation: string; a: number; b: number }) => {
        switch (operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0) throw new Error('Divisão por zero não é permitida');
            return a / b;
        default:
            throw new Error(`Operação desconhecida: ${operation}`);
        }
    },
    };

    /**
     * Ferramenta para buscar informações sobre o clima (simulada)
     */
    export const weatherTool: Tool = {
    name: 'get_weather',
    description: 'Obtém informações sobre o clima de uma cidade',
    parameters: {
        type: 'object',
        properties: {
        city: {
            type: 'string',
            description: 'Nome da cidade',
        },
        },
        required: ['city'],
    },
    execute: async ({ city }: { city: string }) => {
        // Em um projeto real, você faria uma chamada a uma API de clima
        // Por enquanto, vamos simular
        const mockWeather = {
        'São Paulo': { temp: 23, condition: 'Parcialmente nublado' },
        'Rio de Janeiro': { temp: 28, condition: 'Ensolarado' },
        'Curitiba': { temp: 18, condition: 'Chuvoso' },
        };

        const weather = mockWeather[city as keyof typeof mockWeather] || {
        temp: 20,
        condition: 'Dados não disponíveis',
        };

        return `Clima em ${city}: ${weather.temp}°C, ${weather.condition}`;
    },
};

/**
 * Lista de todas as ferramentas disponíveis
 */
export const availableTools: Tool[] = [calculatorTool, weatherTool];