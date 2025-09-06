'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { hiraganaData, Character } from '@/lib/japanese-data'
import { ProgressTracker } from '@/lib/progress-tracker'
import { SpeechService } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

type StudyMode = 'learn' | 'practice' | 'quiz'

export default function HiraganaPage() {
  const [studyMode, setStudyMode] = useState<StudyMode>('learn')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({})
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const progressTracker = ProgressTracker.getInstance()
  const speechService = SpeechService.getInstance()
  const currentChar = hiraganaData[currentIndex]

  useEffect(() => {
    // Load mastery levels
    const levels: Record<string, number> = {}
    hiraganaData.forEach(char => {
      levels[char.character] = progressTracker.getMasteryLevel('hiragana', char.character)
    })
    setMasteryLevels(levels)
  }, [])

  const handleAnswer = (correct: boolean) => {
    progressTracker.updateCharacterProgress('hiragana', currentChar.character, correct)
    setMasteryLevels(prev => ({
      ...prev,
      [currentChar.character]: progressTracker.getMasteryLevel('hiragana', currentChar.character)
    }))

    if (correct) {
      setFeedback('Correct! 正解です！ (Seikai desu!)')
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback(`Incorrect. The answer is "${currentChar.romaji}"`)
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
    }

    setTimeout(() => {
      setFeedback(null)
      setUserInput('')
      setShowAnswer(false)
      if (currentIndex < hiraganaData.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setCurrentIndex(0) // Loop back to start
      }
    }, 2000)
  }

  const checkAnswer = () => {
    if (studyMode === 'practice' || studyMode === 'quiz') {
      const correct = userInput.toLowerCase().trim() === currentChar.romaji.toLowerCase()
      handleAnswer(correct)
    }
  }

  const playAudio = (text: string) => {
    speechService.speak(text, 'ja-JP')
  }

  const nextCharacter = () => {
    if (currentIndex < hiraganaData.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
    setUserInput('')
    setShowAnswer(false)
    setFeedback(null)
  }

  const previousCharacter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setCurrentIndex(hiraganaData.length - 1)
    }
    setUserInput('')
    setShowAnswer(false)
    setFeedback(null)
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500'
    if (mastery >= 60) return 'bg-yellow-500'
    if (mastery >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const overallProgress = Object.values(masteryLevels).reduce((sum, level) => sum + (level >= 70 ? 1 : 0), 0)
  const progressPercentage = (overallProgress / hiraganaData.length) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Hiragana Learning あ</h1>
        <p className="text-lg text-gray-600">
          Master the fundamental Japanese syllabary with 46 characters
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{overallProgress}</div>
            <div className="text-sm text-gray-600">Characters Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{hiraganaData.length}</div>
            <div className="text-sm text-gray-600">Total Characters</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="max-w-md mx-auto h-3" />
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Study Mode</CardTitle>
          <CardDescription>Choose how you want to practice Hiragana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { mode: 'learn' as StudyMode, title: 'Learn', description: 'Study characters with pronunciation', icon: '📚' },
              { mode: 'practice' as StudyMode, title: 'Practice', description: 'Test yourself with input exercises', icon: '✏️' },
              { mode: 'quiz' as StudyMode, title: 'Quiz', description: 'Timed challenge mode', icon: '⚡' }
            ].map(({ mode, title, description, icon }) => (
              <Button
                key={mode}
                variant={studyMode === mode ? 'default' : 'outline'}
                className="h-20 flex flex-col space-y-2"
                onClick={() => setStudyMode(mode)}
              >
                <span className="text-2xl">{icon}</span>
                <div className="text-center">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Learning Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Character {currentIndex + 1} of {hiraganaData.length}</span>
            <Badge 
              className={cn('text-white', getMasteryColor(masteryLevels[currentChar.character] || 0))}
            >
              Mastery: {masteryLevels[currentChar.character] || 0}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Character Display */}
          <div className="text-center space-y-4">
            <div 
              className="text-8xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => playAudio(currentChar.character)}
            >
              {currentChar.character}
            </div>
            
            {(studyMode === 'learn' || showAnswer || feedback) && (
              <div className="space-y-2">
                <div className="text-3xl font-mono text-blue-600">
                  {currentChar.romaji}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAudio(currentChar.character)}
                  className="flex items-center space-x-2"
                >
                  <span>🔊</span>
                  <span>Play Audio</span>
                </Button>
              </div>
            )}
          </div>

          {/* Input Section */}
          {(studyMode === 'practice' || studyMode === 'quiz') && !feedback && (
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-lg font-medium">
                  Type the romaji for this character:
                </label>
              </div>
              <div className="flex space-x-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type romaji here..."
                  className="text-lg text-center"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      checkAnswer()
                    }
                  }}
                />
                <Button onClick={checkAnswer}>Check</Button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={cn(
              'text-center p-4 rounded-lg',
              feedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}>
              {feedback}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={previousCharacter}>
              ← Previous
            </Button>
            
            {studyMode === 'learn' && (
              <Button variant="outline" onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? 'Hide' : 'Show'} Answer
              </Button>
            )}
            
            <Button variant="outline" onClick={nextCharacter}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Score */}
      {studyMode === 'quiz' && score.total > 0 && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Quiz Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </div>
              <div className="text-gray-600">
                {score.correct} correct out of {score.total}
              </div>
              <Progress 
                value={score.total > 0 ? (score.correct / score.total) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Character Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Hiragana Characters</CardTitle>
          <CardDescription>Click on any character to jump to it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {hiraganaData.map((char, index) => {
              const mastery = masteryLevels[char.character] || 0
              return (
                <div
                  key={char.character}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center border-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                    currentIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                    'relative'
                  )}
                  onClick={() => {
                    setCurrentIndex(index)
                    setUserInput('')
                    setShowAnswer(false)
                    setFeedback(null)
                  }}
                >
                  <div className="text-2xl font-bold">{char.character}</div>
                  <div className="text-xs text-gray-600">{char.romaji}</div>
                  <div 
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-1 rounded-b',
                      getMasteryColor(mastery)
                    )}
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}