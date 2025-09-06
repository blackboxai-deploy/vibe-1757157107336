'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { vocabularyData, Vocabulary } from '@/lib/japanese-data'
import { ProgressTracker } from '@/lib/progress-tracker'
import { SpeechService } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

type StudyMode = 'browse' | 'flashcards' | 'quiz'

export default function VocabularyPage() {
  const [studyMode, setStudyMode] = useState<StudyMode>('browse')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filteredWords, setFilteredWords] = useState<Vocabulary[]>(vocabularyData)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedJLPT, setSelectedJLPT] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDefinition, setShowDefinition] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({})

  const progressTracker = ProgressTracker.getInstance()
  const speechService = SpeechService.getInstance()
  const currentWord = filteredWords[currentIndex]

  useEffect(() => {
    // Load mastery levels
    const levels: Record<string, number> = {}
    vocabularyData.forEach(word => {
      const progress = progressTracker.getProgress().vocabulary.find(p => p.word === word.japanese)
      levels[word.japanese] = progress?.mastery || 0
    })
    setMasteryLevels(levels)
  }, [])

  useEffect(() => {
    // Filter words based on category, JLPT level, and search term
    let filtered = vocabularyData

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory)
    }

    if (selectedJLPT !== 'all') {
      filtered = filtered.filter(word => word.jlpt === parseInt(selectedJLPT))
    }

    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.japanese.includes(searchTerm) ||
        word.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredWords(filtered)
    setCurrentIndex(0)
  }, [selectedCategory, selectedJLPT, searchTerm])

  const categories = Array.from(new Set(vocabularyData.map(word => word.category)))
  const jlptLevels = Array.from(new Set(vocabularyData.map(word => word.jlpt))).sort()

  const playAudio = (text: string) => {
    speechService.speak(text, 'ja-JP')
  }

  const checkAnswer = () => {
    if (!currentWord || studyMode !== 'quiz') return

    const correct = userInput.toLowerCase().trim() === currentWord.english.toLowerCase()
    progressTracker.updateVocabularyProgress(currentWord.japanese, correct)
    
    setMasteryLevels(prev => ({
      ...prev,
      [currentWord.japanese]: progressTracker.getProgress().vocabulary.find(p => p.word === currentWord.japanese)?.mastery || 0
    }))

    if (correct) {
      setFeedback('Correct! 正解です！')
    } else {
      setFeedback(`Incorrect. The answer is "${currentWord.english}"`)
    }

    setTimeout(() => {
      setFeedback(null)
      setUserInput('')
      nextWord()
    }, 2000)
  }

  const nextWord = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
    setShowDefinition(false)
    setUserInput('')
    setFeedback(null)
  }

  const previousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setCurrentIndex(filteredWords.length - 1)
    }
    setShowDefinition(false)
    setUserInput('')
    setFeedback(null)
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500'
    if (mastery >= 60) return 'bg-yellow-500'
    if (mastery >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const masteredWords = Object.values(masteryLevels).filter(level => level >= 70).length
  const progressPercentage = vocabularyData.length > 0 ? (masteredWords / vocabularyData.length) * 100 : 0

  if (filteredWords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📖</div>
        <h2 className="text-2xl font-bold mb-4">No words found</h2>
        <p className="text-gray-600">Try adjusting your filters or search term</p>
        <Button 
          onClick={() => {
            setSelectedCategory('all')
            setSelectedJLPT('all')
            setSearchTerm('')
          }}
          className="mt-4"
        >
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Vocabulary Learning 📖</h1>
        <p className="text-lg text-gray-600">
          Build your Japanese vocabulary with essential words and phrases
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{masteredWords}</div>
            <div className="text-sm text-gray-600">Words Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{vocabularyData.length}</div>
            <div className="text-sm text-gray-600">Total Words</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="max-w-md mx-auto h-3" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Customize your vocabulary study session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <Input
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* JLPT Level Filter */}
            <Select value={selectedJLPT} onValueChange={setSelectedJLPT}>
              <SelectTrigger>
                <SelectValue placeholder="JLPT Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {jlptLevels.map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    N{level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-center text-sm text-gray-600 border rounded-lg">
              {filteredWords.length} words
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Study Mode</CardTitle>
          <CardDescription>Choose how you want to study vocabulary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { mode: 'browse' as StudyMode, title: 'Browse', description: 'Explore words with definitions', icon: '📚' },
              { mode: 'flashcards' as StudyMode, title: 'Flashcards', description: 'Test your memory with cards', icon: '🃏' },
              { mode: 'quiz' as StudyMode, title: 'Quiz', description: 'Type the English meaning', icon: '✏️' }
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

      {/* Main Vocabulary Card */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Word {currentIndex + 1} of {filteredWords.length}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {currentWord.category}
              </Badge>
              <Badge variant="outline">
                N{currentWord.jlpt}
              </Badge>
              <Badge className={cn('text-white', getMasteryColor(masteryLevels[currentWord.japanese] || 0))}>
                {masteryLevels[currentWord.japanese] || 0}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center space-y-4">
            <div 
              className="text-6xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => playAudio(currentWord.japanese)}
            >
              {currentWord.japanese}
            </div>
            
            <div className="text-2xl font-mono text-blue-600">
              {currentWord.romaji}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => playAudio(currentWord.japanese)}
              className="flex items-center space-x-2"
            >
              <span>🔊</span>
              <span>Play Audio</span>
            </Button>

            {/* Definition */}
            {(studyMode === 'browse' || (studyMode === 'flashcards' && showDefinition) || feedback) && (
              <div className="text-xl text-gray-800 font-medium">
                {currentWord.english}
              </div>
            )}

            {/* Examples */}
            {currentWord.examples && (studyMode === 'browse' || (studyMode === 'flashcards' && showDefinition)) && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Examples:</h4>
                {currentWord.examples.map((example, index) => (
                  <div key={index} className="text-sm text-gray-600 italic">
                    {example}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz Input */}
          {studyMode === 'quiz' && !feedback && (
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-lg font-medium">
                  What does this word mean in English?
                </label>
              </div>
              <div className="flex space-x-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the English meaning..."
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
            <Button variant="outline" onClick={previousWord}>
              ← Previous
            </Button>
            
            {studyMode === 'flashcards' && !feedback && (
              <Button 
                variant="outline" 
                onClick={() => setShowDefinition(!showDefinition)}
              >
                {showDefinition ? 'Hide' : 'Show'} Definition
              </Button>
            )}
            
            <Button variant="outline" onClick={nextWord}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Word Grid */}
      {studyMode === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Grid</CardTitle>
            <CardDescription>Click on any word to study it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.slice(0, 20).map((word, index) => {
                const mastery = masteryLevels[word.japanese] || 0
                return (
                  <div
                    key={word.japanese}
                    className={cn(
                      'p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                      currentIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    )}
                    onClick={() => {
                      setCurrentIndex(index)
                      setShowDefinition(false)
                      setUserInput('')
                      setFeedback(null)
                    }}
                  >
                    <div className="space-y-2">
                      <div className="text-xl font-bold">{word.japanese}</div>
                      <div className="text-sm text-blue-600">{word.romaji}</div>
                      <div className="text-sm text-gray-600">{word.english}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          N{word.jlpt}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className={cn('w-2 h-2 rounded-full', getMasteryColor(mastery))} />
                          <span className="text-xs">{mastery}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredWords.length > 20 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing first 20 words. Use filters to refine your search.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}