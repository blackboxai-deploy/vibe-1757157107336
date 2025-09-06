'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { grammarData, GrammarPoint } from '@/lib/japanese-data'
import { SpeechService } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

export default function GrammarPage() {
  const [selectedPattern, setSelectedPattern] = useState<GrammarPoint | null>(null)
  const [activeLevel, setActiveLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  const speechService = SpeechService.getInstance()

  const playAudio = (text: string) => {
    speechService.speak(text, 'ja-JP')
  }

  const grammarByLevel = {
    beginner: grammarData.filter(g => g.level === 'beginner'),
    intermediate: grammarData.filter(g => g.level === 'intermediate'),
    advanced: grammarData.filter(g => g.level === 'advanced')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Grammar Patterns 🔤</h1>
        <p className="text-lg text-gray-600">
          Learn essential Japanese grammar patterns and usage rules
        </p>
        
        {/* Hero Image */}
        <div className="max-w-4xl mx-auto">
          <img 
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f91b9885-a847-4e74-b10e-5e3e1782a9e6.png" 
            alt="Traditional Japanese Calligraphy with Grammar Symbols and Patterns Educational Style"
            className="w-full rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grammar Pattern List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Grammar Patterns</CardTitle>
              <CardDescription>Select a level to explore patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeLevel} onValueChange={(value) => setActiveLevel(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="beginner">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate">Medium</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="beginner" className="space-y-2 mt-4">
                  {grammarByLevel.beginner.map((pattern, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer transition-all hover:shadow-md',
                        selectedPattern?.pattern === pattern.pattern 
                          ? 'bg-blue-100 border-blue-500 border-2' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                      onClick={() => setSelectedPattern(pattern)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-mono font-bold">{pattern.pattern}</div>
                        <Badge className={cn('text-white text-xs', getLevelColor(pattern.level))}>
                          {pattern.level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{pattern.meaning}</div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="intermediate" className="space-y-2 mt-4">
                  {grammarByLevel.intermediate.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">📚</div>
                      <p>Intermediate patterns coming soon!</p>
                      <p className="text-sm mt-2">We're adding more grammar patterns</p>
                    </div>
                  ) : (
                    grammarByLevel.intermediate.map((pattern, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all hover:shadow-md',
                          selectedPattern?.pattern === pattern.pattern 
                            ? 'bg-blue-100 border-blue-500 border-2' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        )}
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-bold">{pattern.pattern}</div>
                          <Badge className={cn('text-white text-xs', getLevelColor(pattern.level))}>
                            {pattern.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{pattern.meaning}</div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-2 mt-4">
                  {grammarByLevel.advanced.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🎯</div>
                      <p>Advanced patterns coming soon!</p>
                      <p className="text-sm mt-2">Master the basics first</p>
                    </div>
                  ) : (
                    grammarByLevel.advanced.map((pattern, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all hover:shadow-md',
                          selectedPattern?.pattern === pattern.pattern 
                            ? 'bg-blue-100 border-blue-500 border-2' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        )}
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-bold">{pattern.pattern}</div>
                          <Badge className={cn('text-white text-xs', getLevelColor(pattern.level))}>
                            {pattern.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{pattern.meaning}</div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Grammar Pattern Details */}
        <div className="lg:col-span-2">
          {selectedPattern ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="font-mono text-2xl">{selectedPattern.pattern}</span>
                  <Badge className={cn('text-white', getLevelColor(selectedPattern.level))}>
                    {selectedPattern.level}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  {selectedPattern.meaning}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Explanation */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Explanation</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-900">{selectedPattern.explanation}</p>
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="space-y-4">
                    {selectedPattern.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          {/* Japanese */}
                          <div className="flex items-center space-x-3">
                            <div 
                              className="text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => playAudio(example.japanese)}
                            >
                              {example.japanese}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playAudio(example.japanese)}
                              className="h-8 w-8 p-0"
                            >
                              🔊
                            </Button>
                          </div>
                          
                          {/* Romaji */}
                          <div className="text-blue-600 font-mono">
                            {example.romaji}
                          </div>
                          
                          {/* English */}
                          <div className="text-gray-700">
                            {example.english}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Practice Tips</h3>
                  <div className="p-4 bg-green-50 rounded-lg space-y-2">
                    <div className="text-green-900">
                      <strong>💡 Study Tips:</strong>
                    </div>
                    <ul className="text-green-800 text-sm space-y-1 ml-4">
                      <li>• Read the examples aloud to practice pronunciation</li>
                      <li>• Try creating your own sentences using this pattern</li>
                      <li>• Pay attention to the context where this pattern is used</li>
                      <li>• Practice with the AI tutor for personalized feedback</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => {
                      // Play all example audio
                      selectedPattern.examples.forEach((example, index) => {
                        setTimeout(() => playAudio(example.japanese), index * 3000)
                      })
                    }}
                    variant="outline" 
                    className="flex-1"
                  >
                    🔊 Play All Examples
                  </Button>
                  <Button 
                    onClick={() => {
                      // Navigate to AI tutor with pre-filled question
                      const question = `Can you explain more about the grammar pattern "${selectedPattern.pattern}" and give me more examples?`
                      window.location.href = `/ai-tutor?question=${encodeURIComponent(question)}`
                    }}
                    className="flex-1"
                  >
                    🤖 Ask AI Tutor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🔤</div>
                <h3 className="text-2xl font-semibold">Select a Grammar Pattern</h3>
                <p className="text-gray-600">
                  Choose a grammar pattern from the left to see detailed explanations and examples
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Essential grammar patterns at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grammarData.slice(0, 6).map((pattern, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono font-bold">{pattern.pattern}</div>
                  <Badge variant="outline" className="text-xs">
                    {pattern.level}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {pattern.meaning}
                </div>
                <div className="text-xs text-blue-600">
                  {pattern.examples[0]?.japanese}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grammar Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Grammar Learning Resources</CardTitle>
          <CardDescription>Additional ways to master Japanese grammar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">📝</div>
              <h4 className="font-semibold">Take Quizzes</h4>
              <p className="text-sm text-gray-600">
                Test your grammar knowledge with interactive quizzes
              </p>
              <Button variant="outline" size="sm">
                Grammar Quiz
              </Button>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-4xl">🤖</div>
              <h4 className="font-semibold">AI Tutor</h4>
              <p className="text-sm text-gray-600">
                Get personalized explanations from your AI tutor
              </p>
              <Button variant="outline" size="sm">
                Chat with AI
              </Button>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-4xl">💭</div>
              <h4 className="font-semibold">Practice</h4>
              <p className="text-sm text-gray-600">
                Create your own sentences using these patterns
              </p>
              <Button variant="outline" size="sm">
                Practice Mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}