// list-models.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('📋 Modelos disponíveis:\n');
    for await (const model of models) {
      console.log(`✓ ${model.name}`);
      console.log(`  - Suporta generateContent: ${model.supportedGenerationMethods.includes('generateContent')}`);
      console.log(`  - Descrição: ${model.displayName}\n`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listModels();