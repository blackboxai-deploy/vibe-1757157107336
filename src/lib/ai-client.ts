// AI Client for Japanese Learning Features
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  error?: string;
}

export interface TranslationResult {
  japanese: string;
  english: string;
  romaji?: string;
  confidence: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
}

export class AIClient {
  private static instance: AIClient;
  private baseURL = 'https://oi-server.onrender.com/chat/completions';
  private headers = {
    'customerId': 'cus_StZdQohlTIeIFA',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  };

  private constructor() {}

  public static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  private async makeRequest(messages: AIMessage[], model: string = 'openrouter/anthropic/claude-sonnet-4'): Promise<string> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  public async chatWithTutor(userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    try {
      const systemPrompt: AIMessage = {
        role: 'system',
        content: `You are a friendly and knowledgeable Japanese language tutor. Your role is to:
        
        1. Help students learn Japanese characters (Hiragana, Katakana, Kanji)
        2. Explain grammar concepts clearly with examples
        3. Provide pronunciation guidance
        4. Answer questions about Japanese culture and language usage
        5. Encourage and motivate students in their learning journey
        
        Guidelines:
        - Be patient and encouraging
        - Provide clear explanations with examples
        - Use romaji when helpful for pronunciation
        - Break down complex concepts into simple steps
        - Offer practice suggestions and learning tips
        - Be culturally sensitive and accurate
        
        Always respond in a helpful, encouraging tone suitable for language learners of all levels.`
      };

      const messages: AIMessage[] = [
        systemPrompt,
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      const response = await this.makeRequest(messages);
      
      return {
        message: response,
        suggestions: this.extractSuggestions(response)
      };
    } catch (error) {
      return {
        message: 'I apologize, but I cannot respond right now. Please try again in a moment.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async translateText(text: string, fromLanguage: 'en' | 'ja' = 'en', toLanguage: 'ja' | 'en' = 'ja'): Promise<TranslationResult> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a professional Japanese-English translator. Provide accurate translations with the following JSON format:
          {
            "japanese": "Japanese text",
            "english": "English translation", 
            "romaji": "Romanized pronunciation (if applicable)",
            "confidence": 95
          }
          
          Only return valid JSON. If translating to Japanese, always include romaji. Confidence should be 1-100.`
        },
        {
          role: 'user',
          content: `Translate this ${fromLanguage === 'en' ? 'English' : 'Japanese'} text to ${toLanguage === 'ja' ? 'Japanese' : 'English'}: "${text}"`
        }
      ];

      const response = await this.makeRequest(messages);
      
      try {
        const parsed = JSON.parse(response);
        return {
          japanese: parsed.japanese || '',
          english: parsed.english || '',
          romaji: parsed.romaji,
          confidence: parsed.confidence || 80
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          japanese: fromLanguage === 'ja' ? text : response,
          english: fromLanguage === 'en' ? text : response,
          confidence: 70
        };
      }
    } catch (error) {
      throw new Error('Translation failed. Please try again.');
    }
  }

  public async generateQuiz(type: string, difficulty: 'easy' | 'medium' | 'hard', count: number = 5): Promise<QuizQuestion[]> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a Japanese language quiz generator. Create ${count} multiple choice questions for ${type} at ${difficulty} level.
          
          Return ONLY a valid JSON array with this exact format:
          [
            {
              "question": "Question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": 0,
              "explanation": "Brief explanation of the answer",
              "type": "${type}"
            }
          ]
          
          Guidelines:
          - Questions should be clear and educational
          - Include 4 options per question  
          - correctAnswer is the index (0-3) of the correct option
          - Explanations should be helpful for learning
          - Vary question types (recognition, meaning, usage, etc.)
          - For character questions, include both the character and reading
          
          Return only valid JSON, no other text.`
        },
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} level ${type} quiz questions.`
        }
      ];

      const response = await this.makeRequest(messages);
      
      try {
        const questions = JSON.parse(response);
        return Array.isArray(questions) ? questions : [];
      } catch {
        // Return fallback questions if parsing fails
        return this.getFallbackQuestions(type);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      return this.getFallbackQuestions(type);
    }
  }

  public async explainGrammar(grammarPoint: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a Japanese grammar expert. Explain grammar points clearly and simply for language learners. Include:
          1. What the grammar point means
          2. When and how to use it
          3. 2-3 clear examples with translations
          4. Common mistakes to avoid
          
          Keep explanations concise but thorough, suitable for beginners to intermediate learners.`
        },
        {
          role: 'user',
          content: `Please explain the Japanese grammar point: ${grammarPoint}`
        }
      ];

      return await this.makeRequest(messages);
    } catch (error) {
      return `I apologize, but I cannot explain "${grammarPoint}" right now. Please try again later.`;
    }
  }

  public async providePronunciationTips(text: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a Japanese pronunciation coach. Provide helpful pronunciation tips for Japanese text, including:
          1. Romaji pronunciation guide
          2. Emphasis and tone tips
          3. Common pronunciation mistakes to avoid
          4. Helpful memory aids or tricks
          
          Be encouraging and practical in your advice.`
        },
        {
          role: 'user',
          content: `Please provide pronunciation tips for: ${text}`
        }
      ];

      return await this.makeRequest(messages);
    } catch (error) {
      return `I cannot provide pronunciation tips right now. Please try again later.`;
    }
  }

  private extractSuggestions(response: string): string[] {
    // Extract potential follow-up suggestions from AI response
    const suggestions: string[] = [];
    
    if (response.includes('practice')) {
      suggestions.push('Show me practice exercises');
    }
    if (response.includes('example')) {
      suggestions.push('Give me more examples');
    }
    if (response.includes('quiz')) {
      suggestions.push('Create a quiz for this topic');
    }
    
    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  private getFallbackQuestions(type: string): QuizQuestion[] {
    // Fallback questions if AI generation fails
    const fallbackQuestions: Record<string, QuizQuestion[]> = {
      hiragana: [
        {
          question: 'What is the romaji for あ?',
          options: ['a', 'i', 'u', 'e'],
          correctAnswer: 0,
          explanation: 'あ is pronounced "a" as in "father"',
          type: 'hiragana'
        },
        {
          question: 'What is the romaji for か?',
          options: ['sa', 'ka', 'ta', 'na'],
          correctAnswer: 1,
          explanation: 'か is pronounced "ka"',
          type: 'hiragana'
        }
      ],
      vocabulary: [
        {
          question: 'What does こんにちは mean?',
          options: ['goodbye', 'hello', 'thank you', 'excuse me'],
          correctAnswer: 1,
          explanation: 'こんにちは (konnichiwa) means "hello" or "good afternoon"',
          type: 'vocabulary'
        }
      ]
    };

    return fallbackQuestions[type] || fallbackQuestions.hiragana;
  }
}

// Text-to-Speech functionality
export class SpeechService {
  private static instance: SpeechService;

  private constructor() {}

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public speak(text: string, lang: string = 'ja-JP'): void {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a Japanese voice
      const voices = speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => 
        voice.lang.includes('ja') || voice.name.includes('Japanese')
      );
      
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}