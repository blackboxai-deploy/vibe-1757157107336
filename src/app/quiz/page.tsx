'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AIClient, QuizQuestion } from '@/lib/ai-client'
import { ProgressTracker } from '@/lib/progress-tracker'
import { hiraganaData, katakanaData, kanjiData, vocabularyData } from '@/lib/japanese-data'
import { cn } from '@/lib/utils'

type QuizType = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'mixed'
type QuizDifficulty = 'easy' | 'medium' | 'hard'

interface QuizState {
  questions: QuizQuestion[]
  currentIndex: number
  selectedAnswer: number | null
  score: number
  timeSpent: number
  showResult: boolean
  isComplete: boolean
}

export default function QuizPage() {
  const [quizType, setQuizType] = useState<QuizType>('hiragana')
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('easy')
  const [questionCount, setQuestionCount] = useState(10)
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    selectedAnswer: null,
    score: 0,
    timeSpent: 0,
    showResult: false,
    isComplete: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const aiClient = AIClient.getInstance()
  const progressTracker = ProgressTracker.getInstance()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (quizState.questions.length > 0 && !quizState.isComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [quizState.questions.length, quizState.isComplete])

  const generateQuestions = (type: QuizType, count: number, diff: QuizDifficulty): QuizQuestion[] => {
    const questions: QuizQuestion[] = []
    
    if (type === 'hiragana' || type === 'mixed') {
      const chars = hiraganaData.slice(0, diff === 'easy' ? 10 : diff === 'medium' ? 25 : 46)
      for (let i = 0; i < (type === 'mixed' ? Math.floor(count / 4) : count); i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const options = [char.romaji]
        
        // Add 3 wrong options
        while (options.length < 4) {
          const wrong = chars[Math.floor(Math.random() * chars.length)].romaji
          if (!options.includes(wrong)) {
            options.push(wrong)
          }
        }
        
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[options[j], options[k]] = [options[k], options[j]]
        }
        
        questions.push({
          question: `What is the romaji for ${char.character}?`,
          options,
          correctAnswer: options.indexOf(char.romaji),
          explanation: `${char.character} is pronounced "${char.romaji}"`,
          type: 'hiragana'
        })
      }
    }

    if (type === 'katakana' || type === 'mixed') {
      const chars = katakanaData.slice(0, diff === 'easy' ? 10 : diff === 'medium' ? 25 : 46)
      const questionCount = type === 'mixed' ? Math.floor(count / 4) : count
      
      for (let i = 0; i < questionCount; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const options = [char.romaji]
        
        while (options.length < 4) {
          const wrong = chars[Math.floor(Math.random() * chars.length)].romaji
          if (!options.includes(wrong)) {
            options.push(wrong)
          }
        }
        
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[options[j], options[k]] = [options[k], options[j]]
        }
        
        questions.push({
          question: `What is the romaji for ${char.character}?`,
          options,
          correctAnswer: options.indexOf(char.romaji),
          explanation: `${char.character} is pronounced "${char.romaji}"`,
          type: 'katakana'
        })
      }
    }

    if (type === 'vocabulary' || type === 'mixed') {
      const words = vocabularyData.slice(0, diff === 'easy' ? 20 : diff === 'medium' ? 50 : 100)
      const questionCount = type === 'mixed' ? Math.floor(count / 4) : count
      
      for (let i = 0; i < questionCount; i++) {
        const word = words[Math.floor(Math.random() * words.length)]
        const options = [word.english]
        
        while (options.length < 4) {
          const wrong = words[Math.floor(Math.random() * words.length)].english
          if (!options.includes(wrong)) {
            options.push(wrong)
          }
        }
        
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[options[j], options[k]] = [options[k], options[j]]
        }
        
        questions.push({
          question: `What does ${word.japanese} (${word.romaji}) mean?`,
          options,
          correctAnswer: options.indexOf(word.english),
          explanation: `${word.japanese} (${word.romaji}) means "${word.english}"`,
          type: 'vocabulary'
        })
      }
    }

    return questions.slice(0, count)
  }

  const startQuiz = async () => {
    setIsLoading(true)
    setTimer(0)
    
    try {
      // Try to generate AI questions first, fallback to local generation
      let questions: QuizQuestion[] = []
      
      try {
        questions = await aiClient.generateQuiz(quizType, difficulty, questionCount)
      } catch (error) {
        console.log('AI generation failed, using local questions')
      }
      
      // Fallback to local generation if AI fails or returns empty
      if (questions.length === 0) {
        questions = generateQuestions(quizType, questionCount, difficulty)
      }
      
      setQuizState({
        questions,
        currentIndex: 0,
        selectedAnswer: null,
        score: 0,
        timeSpent: 0,
        showResult: false,
        isComplete: false
      })
    } catch (error) {
      console.error('Failed to generate quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = () => {
    if (quizState.selectedAnswer === null) return

    const currentQuestion = quizState.questions[quizState.currentIndex]
    const isCorrect = quizState.selectedAnswer === currentQuestion.correctAnswer

    setQuizState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 1 : 0),
      showResult: true
    }))

    // Update progress tracking
    if (currentQuestion.type === 'hiragana' || currentQuestion.type === 'katakana') {
      const character = currentQuestion.question.match(/[\u3040-\u309F\u30A0-\u30FF]/)?.[0]
      if (character) {
        progressTracker.updateCharacterProgress(
          currentQuestion.type as 'hiragana' | 'katakana',
          character,
          isCorrect
        )
      }
    }

    setTimeout(() => {
      if (quizState.currentIndex < quizState.questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          selectedAnswer: null,
          showResult: false
        }))
      } else {
        // Quiz complete
        const finalScore = Math.round(((quizState.score + (isCorrect ? 1 : 0)) / quizState.questions.length) * 100)
        progressTracker.recordQuizResult(quizType, finalScore, quizState.questions.length, timer)
        
        setQuizState(prev => ({
          ...prev,
          isComplete: true,
          timeSpent: timer
        }))
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setQuizState({
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      score: 0,
      timeSpent: 0,
      showResult: false,
      isComplete: false
    })
    setTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = quizState.questions[quizState.currentIndex]
  const progress = quizState.questions.length > 0 ? ((quizState.currentIndex + 1) / quizState.questions.length) * 100 : 0

  if (quizState.questions.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Japanese Quiz 📝</h1>
          <p className="text-lg text-gray-600">
            Test your knowledge with customizable quizzes
          </p>
        </div>

        {/* Quiz Setup */}
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>Customize your quiz experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Type */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Quiz Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'hiragana' as QuizType, label: 'Hiragana', icon: 'あ' },
                    { value: 'katakana' as QuizType, label: 'Katakana', icon: 'ア' },
                    { value: 'kanji' as QuizType, label: 'Kanji', icon: '漢' },
                    { value: 'vocabulary' as QuizType, label: 'Vocabulary', icon: '📖' },
                    { value: 'mixed' as QuizType, label: 'Mixed', icon: '🎲' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={quizType === option.value ? 'default' : 'outline'}
                      className="h-16 flex flex-col space-y-1"
                      onClick={() => setQuizType(option.value)}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Difficulty</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'easy' as QuizDifficulty, label: 'Easy', description: 'Basic characters/words' },
                    { value: 'medium' as QuizDifficulty, label: 'Medium', description: 'Intermediate level' },
                    { value: 'hard' as QuizDifficulty, label: 'Hard', description: 'Advanced content' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={difficulty === option.value ? 'default' : 'outline'}
                      className="h-16 flex flex-col space-y-1"
                      onClick={() => setDifficulty(option.value)}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Number of Questions</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? 'default' : 'outline'}
                      onClick={() => setQuestionCount(count)}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startQuiz}
                disabled={isLoading}
                className="w-full h-12 text-lg"
              >
                {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (quizState.isComplete) {
    const finalScore = Math.round((quizState.score / quizState.questions.length) * 100)
    const grade = finalScore >= 90 ? 'Excellent!' : finalScore >= 80 ? 'Great!' : finalScore >= 70 ? 'Good!' : finalScore >= 60 ? 'Not bad!' : 'Keep practicing!'
    
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Quiz Complete! 🎉</h1>
          <p className="text-lg text-gray-600">{grade}</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{finalScore}%</CardTitle>
            <CardDescription>Your final score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{quizState.score}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {quizState.questions.length - quizState.score}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{formatTime(timer)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{quizType}</div>
                <div className="text-sm text-gray-600">Quiz Type</div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                New Quiz
              </Button>
              <Button onClick={startQuiz} className="flex-1">
                Retry Same Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz in Progress</h1>
          <p className="text-gray-600">
            Question {quizState.currentIndex + 1} of {quizState.questions.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{formatTime(timer)}</div>
          <div className="text-sm text-gray-600">Time Elapsed</div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {quizState.currentIndex + 1}</span>
            <Badge variant="secondary">{currentQuestion.type}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-xl font-medium text-center py-4">
            {currentQuestion.question}
          </div>

          {!quizState.showResult && (
            <RadioGroup
              value={quizState.selectedAnswer?.toString() || ''}
              onValueChange={(value) => setQuizState(prev => ({ ...prev, selectedAnswer: parseInt(value) }))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {quizState.showResult && (
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-lg text-center',
                quizState.selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}>
                <div className="font-bold text-lg">
                  {quizState.selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect!'}
                </div>
                <div className="mt-2">{currentQuestion.explanation}</div>
              </div>
              
              <div className="text-center text-gray-600">
                Moving to next question...
              </div>
            </div>
          )}

          {!quizState.showResult && (
            <Button
              onClick={submitAnswer}
              disabled={quizState.selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">
            {quizState.score} / {quizState.currentIndex + (quizState.showResult ? 1 : 0)}
          </div>
          <div className="text-sm text-gray-600">Current Score</div>
        </CardContent>
      </Card>
    </div>
  )
}