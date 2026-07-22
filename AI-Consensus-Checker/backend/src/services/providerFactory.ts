import { AIService } from '../interfaces/aiService';
import { GoogleGeminiService } from './providers/googleGemini.service';
import { GroqService } from './providers/groq.service';
import { OpenRouterService } from './providers/openRouter.service';
import { CerebrasService } from './providers/cerebras.service';
import { TogetherAIService } from './providers/togetherAi.service';

export enum ProviderName {
  GoogleGemini = 'googleGemini',
  Groq = 'groq',
  OpenRouter = 'openRouter',
  Cerebras = 'cerebras',
  TogetherAI = 'togetherAi',
}

export function createProvider(providerName: ProviderName): AIService {
  switch (providerName) {
    case ProviderName.GoogleGemini:
      return new GoogleGeminiService();
    case ProviderName.Groq:
      return new GroqService();
    case ProviderName.OpenRouter:
      return new OpenRouterService();
    case ProviderName.Cerebras:
      return new CerebrasService();
    case ProviderName.TogetherAI:
      return new TogetherAIService();
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
