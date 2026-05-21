export interface AIProvider {
  generateDiagnostic(input: string): Promise<string>;
}

export class OpenAIProvider implements AIProvider {
  async generateDiagnostic(input: string): Promise<string> {
    return `Diagnóstico generado con OpenAI para: ${input}`;
  }
}

export class AnthropicProvider implements AIProvider {
  async generateDiagnostic(input: string): Promise<string> {
    return `Diagnóstico generado con Anthropic para: ${input}`;
  }
}

export class DiagnosticService {
  constructor(private provider: AIProvider) {}

  async generate(input: string) {
    return this.provider.generateDiagnostic(input);
  }
}