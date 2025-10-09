import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface CollapsibleCardProps {
  title: string
  icon: React.ReactNode
  count: number
  defaultOpen?: boolean
  variant?: 'fiscal' | 'gestor' | 'default'
  onToggle?: (isOpen: boolean) => void
  children: React.ReactNode
  headerAction?: React.ReactNode
  className?: string
}

const variantStyles = {
  fiscal: {
    border: 'hover:border-blue-300',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-800',
    headerBg: 'hover:bg-blue-50/50',
  },
  gestor: {
    border: 'hover:border-green-300',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100 text-green-800',
    headerBg: 'hover:bg-green-50/50',
  },
  default: {
    border: 'hover:border-gray-300',
    iconColor: 'text-gray-600',
    badgeBg: 'bg-gray-100 text-gray-800',
    headerBg: 'hover:bg-gray-50/50',
  },
}

export const CollapsibleCard = ({
  title,
  icon,
  count,
  defaultOpen = false,
  variant = 'default',
  onToggle,
  children,
  headerAction,
  className,
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = (open: boolean) => {
    setIsOpen(open)
    onToggle?.(open)
  }

  const styles = variantStyles[variant]

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <Card
        className={cn(
          'transition-all duration-200',
          styles.border,
          className,
        )}
      >
        <CollapsibleTrigger className="w-full" asChild>
          <CardHeader
            className={cn(
              'flex cursor-pointer flex-row items-center justify-between transition-colors duration-150',
              styles.headerBg,
            )}
          >
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <div className={cn('transition-colors', styles.iconColor)}>
                  {icon}
                </div>
                {title}
              </CardTitle>
              <Badge className={cn('text-xs font-semibold', styles.badgeBg)}>
                {count}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {headerAction && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {headerAction}
                </div>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-500 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>{children}</CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
