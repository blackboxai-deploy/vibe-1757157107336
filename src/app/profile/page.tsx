'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgressTracker, UserProgress } from '@/lib/progress-tracker'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const progressTracker = ProgressTracker.getInstance()
    const progress = progressTracker.getProgress()
    setUserProgress(progress)
    setIsLoading(false)
  }, [])

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const progressTracker = ProgressTracker.getInstance()
      progressTracker.resetProgress()
      const newProgress = progressTracker.getProgress()
      setUserProgress(newProgress)
    }
  }

  if (isLoading || !userProgress) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '✨'
    if (streak >= 3) return '💪'
    return '🌱'
  }

  const getLevelProgress = (xp: number) => {
    const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
    let currentLevel = 1
    let nextLevelXP = 100
    
    for (let i = 0; i < levels.length - 1; i++) {
      if (xp >= levels[i] && xp < levels[i + 1]) {
        currentLevel = i + 1
        nextLevelXP = levels[i + 1]
        break
      } else if (xp >= levels[levels.length - 1]) {
        currentLevel = levels.length
        nextLevelXP = levels[levels.length - 1]
      }
    }
    
    const currentLevelXP = levels[currentLevel - 1] || 0
    const progress = currentLevel >= levels.length ? 100 : ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    
    return { currentLevel, nextLevelXP, progress, currentLevelXP }
  }

  const levelInfo = getLevelProgress(userProgress.stats.xp)
  const recentQuizzes = userProgress.quizzes.slice(-5).reverse()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            👤
          </div>
          <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 capitalize">
            {userProgress.stats.level}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold">Profile & Progress</h1>
        <p className="text-lg text-gray-600">Track your Japanese learning journey</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{userProgress.stats.xp}</div>
            <div className="text-sm text-gray-600">XP Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600 flex items-center justify-center space-x-2">
              <span>{getStreakEmoji(userProgress.studyStreak)}</span>
              <span>{userProgress.studyStreak}</span>
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{userProgress.stats.totalQuizzes}</div>
            <div className="text-sm text-gray-600">Quizzes Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(userProgress.stats.averageScore)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Level Progress
            <Badge variant="outline" className="text-lg px-3 py-1">
              Level {levelInfo.currentLevel}
            </Badge>
          </CardTitle>
          <CardDescription>
            {levelInfo.currentLevel >= 10 ? 
              'Maximum level reached! You are a Japanese master!' :
              `${levelInfo.nextLevelXP - userProgress.stats.xp} XP to next level`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={levelInfo.progress} className="h-4" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{levelInfo.currentLevelXP} XP</span>
            <span>{levelInfo.nextLevelXP} XP</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Progress Tabs */}
      <Tabs defaultValue="characters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Characters Tab */}
        <TabsContent value="characters" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hiragana Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">あ</span>
                  <span>Hiragana</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {userProgress.hiragana.filter(p => p.mastery >= 70).length}
                  </div>
                  <div className="text-sm text-gray-600">/ 46 mastered</div>
                </div>
                <Progress 
                  value={(userProgress.hiragana.filter(p => p.mastery >= 70).length / 46) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Katakana Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">ア</span>
                  <span>Katakana</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProgress.katakana.filter(p => p.mastery >= 70).length}
                  </div>
                  <div className="text-sm text-gray-600">/ 46 mastered</div>
                </div>
                <Progress 
                  value={(userProgress.katakana.filter(p => p.mastery >= 70).length / 46) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Kanji Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">漢</span>
                  <span>Kanji</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProgress.kanji.filter(p => p.mastery >= 70).length}
                  </div>
                  <div className="text-sm text-gray-600">/ 200 mastered</div>
                </div>
                <Progress 
                  value={(userProgress.kanji.filter(p => p.mastery >= 70).length / 200) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Progress</CardTitle>
              <CardDescription>Words you have learned and their mastery levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userProgress.vocabulary.filter(p => p.mastery >= 70).length}
                  </div>
                  <div className="text-sm text-gray-600">Words Mastered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {userProgress.vocabulary.filter(p => p.mastery >= 40 && p.mastery < 70).length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
              
              {userProgress.vocabulary.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Recent Vocabulary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {userProgress.vocabulary.slice(-10).map((vocab) => {
                      const masteryColor = vocab.mastery >= 80 ? 'bg-green-500' :
                                         vocab.mastery >= 60 ? 'bg-yellow-500' :
                                         vocab.mastery >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      
                      return (
                        <div key={vocab.word} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                          <span className="font-medium">{vocab.word}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{vocab.mastery}%</span>
                            <div className={cn('w-2 h-2 rounded-full', masteryColor)} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz History Tab */}
        <TabsContent value="quizzes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Results</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>No quizzes completed yet</p>
                  <p className="text-sm mt-2">Take your first quiz to see results here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentQuizzes.map((quiz, index) => {
                    const scoreColor = quiz.score >= 90 ? 'text-green-600' :
                                     quiz.score >= 80 ? 'text-blue-600' :
                                     quiz.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {quiz.quizType === 'hiragana' ? 'あ' :
                             quiz.quizType === 'katakana' ? 'ア' :
                             quiz.quizType === 'kanji' ? '漢' :
                             quiz.quizType === 'vocabulary' ? '📖' : '🎲'}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{quiz.quizType} Quiz</div>
                            <div className="text-sm text-gray-600">
                              {new Date(quiz.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn('text-2xl font-bold', scoreColor)}>
                            {quiz.score}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {quiz.correctAnswers}/{quiz.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Milestones you have unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              {userProgress.achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🏆</div>
                  <p>No achievements yet</p>
                  <p className="text-sm mt-2">Keep learning to unlock achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProgress.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-yellow-800">{achievement.name}</div>
                        <div className="text-sm text-yellow-700">{achievement.description}</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Progress */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Reset Progress</CardTitle>
          <CardDescription>
            This will permanently delete all your progress data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={resetProgress}>
            Reset All Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}