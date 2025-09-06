'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: '📊',
    description: 'Overview and progress'
  },
  {
    title: 'Learning',
    items: [
      {
        title: 'Hiragana',
        href: '/hiragana',
        icon: 'あ',
        description: 'Learn basic Japanese characters'
      },
      {
        title: 'Katakana',
        href: '/katakana',
        icon: 'ア',
        description: 'Learn foreign word characters'
      },
      {
        title: 'Kanji',
        href: '/kanji',
        icon: '漢',
        description: 'Learn Chinese characters'
      },
      {
        title: 'Vocabulary',
        href: '/vocabulary',
        icon: '📖',
        description: 'Essential Japanese words'
      },
      {
        title: 'Grammar',
        href: '/grammar',
        icon: '🔤',
        description: 'Grammar patterns and rules'
      }
    ]
  },
  {
    title: 'Practice',
    items: [
      {
        title: 'Quiz',
        href: '/quiz',
        icon: '❓',
        description: 'Test your knowledge'
      },
      {
        title: 'AI Tutor',
        href: '/ai-tutor',
        icon: '🤖',
        description: 'Chat with AI teacher'
      }
    ]
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: '👤',
    description: 'Stats and achievements'
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      'flex flex-col border-r bg-card transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl">🇯🇵</div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold">Japanese</span>
              <span className="text-sm text-muted-foreground">Learning</span>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? '→' : '←'}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => {
            if (item.items) {
              return (
                <div key={index} className="space-y-2">
                  {!collapsed && (
                    <>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                        {item.title}
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}
                  {item.items.map((subItem) => (
                    <Link key={subItem.href} href={subItem.href}>
                      <Button
                        variant={pathname === subItem.href ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start h-auto p-2',
                          collapsed ? 'px-2' : 'px-3'
                        )}
                      >
                        <span className="text-lg mr-2">{subItem.icon}</span>
                        {!collapsed && (
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{subItem.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {subItem.description}
                            </span>
                          </div>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-auto p-2',
                    collapsed ? 'px-2' : 'px-3'
                  )}
                >
                  <span className="text-lg mr-2">{item.icon}</span>
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Progress Section */}
      {!collapsed && (
        <div className="border-t p-4 space-y-3">
          <div className="text-sm font-medium">Daily Progress</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Characters</span>
              <span>12/46</span>
            </div>
            <Progress value={26} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Vocabulary</span>
              <span>8/50</span>
            </div>
            <Progress value={16} className="h-2" />
          </div>
        </div>
      )}
    </div>
  )
}