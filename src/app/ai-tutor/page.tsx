'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AIClient, AIMessage, TranslationResult } from '@/lib/ai-client'
import { SpeechService } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

interface ChatMessage extends AIMessage {
  id: string
  timestamp: Date
}

type ActiveFeature = 'chat' | 'translation' | 'pronunciation' | 'grammar'

export default function AITutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('chat')
  const [translationText, setTranslationText] = useState('')
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [pronunciationText, setPronunciationText] = useState('')
  const [grammarQuery, setGrammarQuery] = useState('')
  const [grammarExplanation, setGrammarExplanation] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiClient = AIClient.getInstance()
  const speechService = SpeechService.getInstance()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await aiClient.chatWithTutor(currentMessage, messages)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslation = async () => {
    if (!translationText.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const result = await aiClient.translateText(translationText)
      setTranslationResult(result)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePronunciation = async () => {
    if (!pronunciationText.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const tips = await aiClient.providePronunciationTips(pronunciationText)
      
      // Add to chat as a special message
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Pronunciation tips for "${pronunciationText}":\n\n${tips}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, message])
      
      // Also play the pronunciation
      speechService.speak(pronunciationText, 'ja-JP')
    } catch (error) {
      console.error('Pronunciation request failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrammarExplanation = async () => {
    if (!grammarQuery.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const explanation = await aiClient.explainGrammar(grammarQuery)
      setGrammarExplanation(explanation)
    } catch (error) {
      console.error('Grammar explanation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = (text: string) => {
    speechService.speak(text, 'ja-JP')
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearChat = () => {
    setMessages([])
  }

  const features = [
    { key: 'chat' as ActiveFeature, title: 'AI Chat', icon: '💬', description: 'Chat with your AI tutor' },
    { key: 'translation' as ActiveFeature, title: 'Translate', icon: '🔤', description: 'Translate text between languages' },
    { key: 'pronunciation' as ActiveFeature, title: 'Pronunciation', icon: '🎤', description: 'Get pronunciation help' },
    { key: 'grammar' as ActiveFeature, title: 'Grammar', icon: '📚', description: 'Explain grammar points' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Japanese Tutor 🤖</h1>
        <p className="text-lg text-gray-600">
          Get personalized help with learning Japanese from your AI tutor
        </p>
      </div>

      {/* Feature Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Button
                key={feature.key}
                variant={activeFeature === feature.key ? 'default' : 'outline'}
                className="h-20 flex flex-col space-y-2"
                onClick={() => setActiveFeature(feature.key)}
              >
                <span className="text-2xl">{feature.icon}</span>
                <div className="text-center">
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Interface */}
          {activeFeature === 'chat' && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  AI Tutor Chat
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    Clear Chat
                  </Button>
                </CardTitle>
                <CardDescription>
                  Ask questions about Japanese language, culture, or get help with your studies
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-6xl mb-4">🤖</div>
                        <p>Welcome! I'm your AI Japanese tutor.</p>
                        <p className="text-sm mt-2">Ask me anything about Japanese language or culture!</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex space-x-3',
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                        )}
                      >
                        <div className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
                          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                        )}>
                          {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className={cn(
                          'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg',
                          message.role === 'user' 
                            ? 'bg-blue-500 text-white ml-auto' 
                            : 'bg-gray-100 text-gray-900'
                        )}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className={cn(
                            'text-xs mt-1 opacity-70',
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          )}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-sm">
                          🤖
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <Separator />
                
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Translation Interface */}
          {activeFeature === 'translation' && (
            <Card>
              <CardHeader>
                <CardTitle>Translation Helper</CardTitle>
                <CardDescription>
                  Translate between English and Japanese
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={translationText}
                  onChange={(e) => setTranslationText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={4}
                />
                <Button 
                  onClick={handleTranslation}
                  disabled={isLoading || !translationText.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Translating...' : 'Translate'}
                </Button>
                
                {translationResult && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Japanese:</h4>
                      <p className="text-lg">{translationResult.japanese}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(translationResult.japanese)}
                        className="mt-2"
                      >
                        🔊 Play Audio
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-semibold">English:</h4>
                      <p>{translationResult.english}</p>
                    </div>
                    {translationResult.romaji && (
                      <div>
                        <h4 className="font-semibold">Romaji:</h4>
                        <p className="font-mono">{translationResult.romaji}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      Confidence: {translationResult.confidence}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pronunciation Helper */}
          {activeFeature === 'pronunciation' && (
            <Card>
              <CardHeader>
                <CardTitle>Pronunciation Helper</CardTitle>
                <CardDescription>
                  Get pronunciation tips and audio for Japanese text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={pronunciationText}
                  onChange={(e) => setPronunciationText(e.target.value)}
                  placeholder="Enter Japanese text or romaji..."
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={handlePronunciation}
                    disabled={isLoading || !pronunciationText.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Getting Tips...' : 'Get Pronunciation Tips'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => playAudio(pronunciationText)}
                    disabled={!pronunciationText.trim()}
                  >
                    🔊 Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grammar Explanation */}
          {activeFeature === 'grammar' && (
            <Card>
              <CardHeader>
                <CardTitle>Grammar Explanation</CardTitle>
                <CardDescription>
                  Get detailed explanations of Japanese grammar points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={grammarQuery}
                  onChange={(e) => setGrammarQuery(e.target.value)}
                  placeholder="Enter grammar point (e.g., は particle, だ vs です, etc.)"
                />
                <Button 
                  onClick={handleGrammarExplanation}
                  disabled={isLoading || !grammarQuery.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Explaining...' : 'Explain Grammar'}
                </Button>
                
                {grammarExplanation && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="whitespace-pre-wrap">{grammarExplanation}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Phrases */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Phrases</CardTitle>
              <CardDescription>Common phrases to practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'Hello' },
                { japanese: 'ありがとう', romaji: 'arigatou', english: 'Thank you' },
                { japanese: 'すみません', romaji: 'sumimasen', english: 'Excuse me' },
                { japanese: 'おはよう', romaji: 'ohayou', english: 'Good morning' },
                { japanese: 'さようなら', romaji: 'sayounara', english: 'Goodbye' }
              ].map((phrase) => (
                <div
                  key={phrase.japanese}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => playAudio(phrase.japanese)}
                >
                  <div className="font-medium">{phrase.japanese}</div>
                  <div className="text-sm text-gray-600">{phrase.romaji}</div>
                  <div className="text-sm text-gray-500">{phrase.english}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">💡 Ask specific questions</div>
                <div className="text-blue-700">
                  "How do I use the は particle?" works better than "Help with grammar"
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">🎧 Practice pronunciation</div>
                <div className="text-green-700">
                  Click on Japanese text to hear native pronunciation
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900">📚 Context matters</div>
                <div className="text-purple-700">
                  Ask about when and how to use words in different situations
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}