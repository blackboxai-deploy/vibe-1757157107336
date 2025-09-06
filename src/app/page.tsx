'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProgressTracker, UserProgress } from '@/lib/progress-tracker'

interface LearningModule {
  title: string
  description: string
  icon: string
  href: string
  progress: number
  total: number
  color: string
}

export default function DashboardPage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const progressTracker = ProgressTracker.getInstance()
    const progress = progressTracker.getProgress()
    setUserProgress(progress)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading your progress...</div>
      </div>
    )
  }

  const learningModules: LearningModule[] = [
    {
      title: 'Hiragana',
      description: 'Learn basic Japanese characters',
      icon: 'あ',
      href: '/hiragana',
      progress: userProgress?.hiragana.filter(p => p.mastery >= 70).length || 0,
      total: 46,
      color: 'bg-pink-500'
    },
    {
      title: 'Katakana',
      description: 'Learn foreign word characters',
      icon: 'ア',
      href: '/katakana',
      progress: userProgress?.katakana.filter(p => p.mastery >= 70).length || 0,
      total: 46,
      color: 'bg-blue-500'
    },
    {
      title: 'Kanji',
      description: 'Learn Chinese characters',
      icon: '漢',
      href: '/kanji',
      progress: userProgress?.kanji.filter(p => p.mastery >= 70).length || 0,
      total: 200,
      color: 'bg-purple-500'
    },
    {
      title: 'Vocabulary',
      description: 'Essential Japanese words',
      icon: '📖',
      href: '/vocabulary',
      progress: userProgress?.vocabulary.filter(p => p.mastery >= 70).length || 0,
      total: 1000,
      color: 'bg-green-500'
    },
    {
      title: 'Grammar',
      description: 'Grammar patterns and rules',
      icon: '🔤',
      href: '/grammar',
      progress: userProgress?.grammar.filter(p => p.mastery >= 70).length || 0,
      total: 50,
      color: 'bg-orange-500'
    }
  ]

  const recentAchievements = userProgress?.achievements.slice(-3) || []

  const totalMastery = learningModules.reduce((sum, module) => sum + module.progress, 0)
  const totalPossible = learningModules.reduce((sum, module) => sum + module.total, 0)
  const overallProgress = totalPossible > 0 ? (totalMastery / totalPossible) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Japanese Learning! 🎌
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master the Japanese language through interactive lessons, quizzes, and AI-powered tutoring.
          Your journey to fluency starts here!
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Progress
            <Badge variant="outline" className="text-lg">
              Level: {userProgress?.stats.level || 'Beginner'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Your total progress across all learning modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Total Mastery</span>
            <span>{totalMastery} / {totalPossible} items learned</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userProgress?.stats.xp || 0}
              </div>
              <div className="text-sm text-gray-600">XP Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userProgress?.studyStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userProgress?.stats.totalQuizzes || 0}
              </div>
              <div className="text-sm text-gray-600">Quizzes Taken</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((module) => (
            <Card key={module.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{module.icon}</div>
                    <div>{module.title}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${module.color}`} />
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{module.progress} / {module.total}</span>
                </div>
                <Progress 
                  value={module.total > 0 ? (module.progress / module.total) * 100 : 0} 
                  className="h-2" 
                />
                <Link href={module.href}>
                  <Button className="w-full">
                    {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into practice and testing</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/quiz">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <span className="text-2xl">❓</span>
              <span>Take a Quiz</span>
            </Button>
          </Link>
          <Link href="/ai-tutor">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <span className="text-2xl">🤖</span>
              <span>AI Tutor Chat</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <span className="text-2xl">👤</span>
              <span>View Profile</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-gray-600">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Image */}
      <div className="text-center">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8cbc3349-9ff6-49b8-85bc-72ff814c0471.png" 
          alt="Japanese Cherry Blossoms with Traditional Temple Scene Beautiful Serene Landscape"
          className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  )
}