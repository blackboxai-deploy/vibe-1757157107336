'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { kanjiData, Kanji } from '@/lib/japanese-data'
import { ProgressTracker } from '@/lib/progress-tracker'
import { SpeechService } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

type StudyMode = 'learn' | 'practice' | 'quiz'

export default function KanjiPage() {
  const [studyMode, setStudyMode] = useState<StudyMode>('learn')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filteredKanji, setFilteredKanji] = useState<Kanji[]>(kanjiData)
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedJLPT, setSelectedJLPT] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({})

  const progressTracker = ProgressTracker.getInstance()
  const speechService = SpeechService.getInstance()
  const currentKanji = filteredKanji[currentIndex]

  useEffect(() => {
    // Load mastery levels
    const levels: Record<string, number> = {}
    kanjiData.forEach(kanji => {
      levels[kanji.character] = progressTracker.getMasteryLevel('kanji', kanji.character)
    })
    setMasteryLevels(levels)
  }, [])

  useEffect(() => {
    // Filter kanji based on grade, JLPT level, and search term
    let filtered = kanjiData

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(kanji => kanji.grade === parseInt(selectedGrade))
    }

    if (selectedJLPT !== 'all') {
      filtered = filtered.filter(kanji => kanji.jlpt === parseInt(selectedJLPT))
    }

    if (searchTerm) {
      filtered = filtered.filter(kanji => 
        kanji.character.includes(searchTerm) ||
        (kanji.meaning && kanji.meaning.toLowerCase().includes(searchTerm.toLowerCase())) ||
        kanji.readings.kunyomi.some(reading => reading.includes(searchTerm)) ||
        kanji.readings.onyomi.some(reading => reading.includes(searchTerm))
      )
    }

    setFilteredKanji(filtered)
    setCurrentIndex(0)
  }, [selectedGrade, selectedJLPT, searchTerm])

  const grades = Array.from(new Set(kanjiData.map(kanji => kanji.grade))).sort()
  const jlptLevels = Array.from(new Set(kanjiData.map(kanji => kanji.jlpt))).sort()

  const playAudio = (text: string) => {
    speechService.speak(text, 'ja-JP')
  }

  const checkAnswer = () => {
    if (!currentKanji || studyMode !== 'quiz') return

    const correct = userInput.toLowerCase().trim() === currentKanji.meaning.toLowerCase()
    progressTracker.updateCharacterProgress('kanji', currentKanji.character, correct)
    
    setMasteryLevels(prev => ({
      ...prev,
      [currentKanji.character]: progressTracker.getMasteryLevel('kanji', currentKanji.character)
    }))

    if (correct) {
      setFeedback('Correct! 正解です！')
    } else {
      setFeedback(`Incorrect. The meaning is "${currentKanji.meaning}"`)
    }

    setTimeout(() => {
      setFeedback(null)
      setUserInput('')
      nextKanji()
    }, 2000)
  }

  const nextKanji = () => {
    if (currentIndex < filteredKanji.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
    setShowDetails(false)
    setUserInput('')
    setFeedback(null)
  }

  const previousKanji = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setCurrentIndex(filteredKanji.length - 1)
    }
    setShowDetails(false)
    setUserInput('')
    setFeedback(null)
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500'
    if (mastery >= 60) return 'bg-yellow-500'
    if (mastery >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const masteredKanji = Object.values(masteryLevels).filter(level => level >= 70).length
  const progressPercentage = kanjiData.length > 0 ? (masteredKanji / kanjiData.length) * 100 : 0

  if (filteredKanji.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">漢</div>
        <h2 className="text-2xl font-bold mb-4">No kanji found</h2>
        <p className="text-gray-600">Try adjusting your filters or search term</p>
        <Button 
          onClick={() => {
            setSelectedGrade('all')
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
        <h1 className="text-4xl font-bold">Kanji Learning 漢</h1>
        <p className="text-lg text-gray-600">
          Master essential Japanese kanji characters with meanings and readings
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{masteredKanji}</div>
            <div className="text-sm text-gray-600">Kanji Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{kanjiData.length}</div>
            <div className="text-sm text-gray-600">Total Kanji</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="max-w-md mx-auto h-3" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Customize your kanji study session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <Input
              placeholder="Search kanji, meaning, or reading..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Grade Filter */}
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
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
              {filteredKanji.length} kanji
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Study Mode</CardTitle>
          <CardDescription>Choose how you want to study kanji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { mode: 'learn' as StudyMode, title: 'Learn', description: 'Study kanji with meanings and readings', icon: '📚' },
              { mode: 'practice' as StudyMode, title: 'Practice', description: 'Review with flashcard-style practice', icon: '🃏' },
              { mode: 'quiz' as StudyMode, title: 'Quiz', description: 'Test your kanji knowledge', icon: '✏️' }
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

      {/* Main Kanji Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kanji {currentIndex + 1} of {filteredKanji.length}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Grade {currentKanji.grade}
              </Badge>
              <Badge variant="outline">
                N{currentKanji.jlpt}
              </Badge>
              <Badge className={cn('text-white', getMasteryColor(masteryLevels[currentKanji.character] || 0))}>
                {masteryLevels[currentKanji.character] || 0}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kanji Display */}
          <div className="text-center space-y-4">
            <div 
              className="text-8xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => playAudio(currentKanji.character)}
            >
              {currentKanji.character}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => playAudio(currentKanji.character)}
              className="flex items-center space-x-2"
            >
              <span>🔊</span>
              <span>Play Audio</span>
            </Button>

            {/* Meaning (always visible in learn mode) */}
            {(studyMode === 'learn' || (studyMode === 'practice' && showDetails) || feedback) && (
              <div className="text-2xl font-semibold text-gray-800">
                {currentKanji.meaning}
              </div>
            )}

            {/* Readings */}
            {(studyMode === 'learn' || (studyMode === 'practice' && showDetails) || feedback) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">Kun'yomi (Japanese reading)</h4>
                  <div className="space-y-1">
                    {currentKanji.readings.kunyomi.map((reading, index) => (
                      <div key={index} className="text-lg text-blue-600 font-mono">
                        {reading}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">On'yomi (Chinese reading)</h4>
                  <div className="space-y-1">
                    {currentKanji.readings.onyomi.map((reading, index) => (
                      <div key={index} className="text-lg text-purple-600 font-mono">
                        {reading}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Examples */}
            {currentKanji.examples && (studyMode === 'learn' || (studyMode === 'practice' && showDetails)) && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentKanji.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{example.split(' ')[0]}</div>
                      <div className="text-sm text-gray-600">{example.split(' - ')[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quiz Input */}
          {studyMode === 'quiz' && !feedback && (
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-lg font-medium">
                  What does this kanji mean?
                </label>
              </div>
              <div className="flex space-x-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the meaning in English..."
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
            <Button variant="outline" onClick={previousKanji}>
              ← Previous
            </Button>
            
            {studyMode === 'practice' && !feedback && (
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            )}
            
            <Button variant="outline" onClick={nextKanji}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanji Grid */}
      {studyMode === 'learn' && (
        <Card>
          <CardHeader>
            <CardTitle>Kanji Grid</CardTitle>
            <CardDescription>Click on any kanji to study it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredKanji.slice(0, 32).map((kanji, index) => {
                const mastery = masteryLevels[kanji.character] || 0
                return (
                  <div
                    key={kanji.character}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center border-2 rounded-lg cursor-pointer transition-all hover:shadow-md relative',
                      currentIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    )}
                    onClick={() => {
                      setCurrentIndex(index)
                      setShowDetails(false)
                      setUserInput('')
                      setFeedback(null)
                    }}
                  >
                    <div className="text-2xl font-bold">{kanji.character}</div>
                    <div className="text-xs text-gray-600 text-center">{kanji.meaning}</div>
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
            {filteredKanji.length > 32 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing first 32 kanji. Use filters to refine your search.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}