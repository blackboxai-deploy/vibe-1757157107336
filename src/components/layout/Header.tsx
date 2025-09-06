'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressTracker } from '@/lib/progress-tracker'

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [userStats, setUserStats] = useState({
    level: 'beginner',
    xp: 0,
    studyStreak: 0
  })

  useEffect(() => {
    // Update time
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)

    // Load user stats
    const progressTracker = ProgressTracker.getInstance()
    const progress = progressTracker.getProgress()
    setUserStats({
      level: progress.stats.level,
      xp: progress.stats.xp,
      studyStreak: progress.studyStreak
    })

    return () => clearInterval(interval)
  }, [])

  const playMotivationalSound = () => {
    // Simple motivational interaction
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('がんばって！') // "Ganbatte!" - Good luck!
      utterance.lang = 'ja-JP'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-semibold">Japanese Learning</h1>
          <p className="text-sm text-muted-foreground">Master Japanese step by step</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Study Stats */}
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{userStats.studyStreak}</div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{userStats.xp}</div>
            <div className="text-xs text-muted-foreground">XP points</div>
          </div>
        </div>

        {/* Level Badge */}
        <Badge variant="secondary" className="capitalize">
          {userStats.level}
        </Badge>

        {/* Time */}
        <div className="text-sm text-muted-foreground font-mono">
          {currentTime}
        </div>

        {/* Motivation Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={playMotivationalSound}
          className="text-xs"
        >
          がんばって！
        </Button>
      </div>
    </header>
  )
}