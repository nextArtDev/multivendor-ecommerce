# Half Star

```ts
// add to CSS
.clip-path-half {
  clip-path: inset(0 50% 0 0);
}

'use client'

import * as React from 'react'
import { Star, Heart, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  icon?: 'star' | 'heart' | 'thumbsUp'
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
  allowHalf?: boolean
  disabled?: boolean
  tooltips?: string[]
}

const iconMap = {
  star: Star,
  heart: Heart,
  thumbsUp: ThumbsUp,
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export const Rating = React.memo(
  React.forwardRef<HTMLDivElement, RatingProps>(
    (
      {
        value,
        onChange,
        max = 5,
        icon = 'star',
        size = 'md',
        readOnly = false,
        className,
        allowHalf = false,
        disabled = false,
        tooltips,
        ...props
      },
      ref
    ) => {
      const [hoverValue, setHoverValue] = React.useState<number | null>(null)
      const ratingContainerRef = React.useRef<HTMLDivElement>(null)
      const Icon = iconMap[icon]

      const isInteractive = !readOnly && !disabled

      const calculateRating = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
          if (!isInteractive || !ratingContainerRef.current) return null

          const { left, width } = ratingContainerRef.current.getBoundingClientRect()
          const iconWidth = width / max
          const x = event.clientX - left
          const iconIndex = Math.floor(x / iconWidth)
          
          if (allowHalf) {
            const iconPosition = x - iconIndex * iconWidth
            return iconIndex + (iconPosition < iconWidth / 2 ? 0.5 : 1)
          }
          
          return iconIndex + 1
        },
        [max, allowHalf, isInteractive]
      )

      const handleMouseMove = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
          const rating = calculateRating(event)
          if (rating !== null) {
            setHoverValue(Math.min(rating, max))
          }
        },
        [calculateRating, max]
      )

      const handleMouseLeave = React.useCallback(() => {
        setHoverValue(null)
      }, [])

      const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
          const rating = calculateRating(event)
          if (rating !== null && onChange) {
            onChange(Math.min(rating, max))
          }
        },
        [calculateRating, max, onChange]
      )

      const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (!isInteractive) return

          const currentValue = value || 0
          let newValue = currentValue

          switch (event.key) {
            case 'ArrowRight':
            case 'ArrowUp':
              newValue = Math.min(allowHalf ? currentValue + 0.5 : currentValue + 1, max)
              break
            case 'ArrowLeft':
            case 'ArrowDown':
              newValue = Math.max(allowHalf ? currentValue - 0.5 : currentValue - 1, 0)
              break
            case 'Home':
              newValue = 0
              break
            case 'End':
              newValue = max
              break
            default:
              return
          }

          event.preventDefault()
          if (onChange && newValue !== currentValue) {
            onChange(newValue)
          }
        },
        [value, max, onChange, allowHalf, isInteractive]
      )

      const renderIcon = React.useCallback(
        (index: number) => {
          const displayValue = hoverValue !== null ? hoverValue : value
          const filled = displayValue >= index + 1
          const halfFilled = allowHalf && displayValue === index + 0.5

          const tooltip = tooltips?.[index]
          
          return (
            <div
              key={index}
              className={cn(
                'relative inline-flex items-center justify-center',
                sizeMap[size]
              )}
              title={tooltip}
            >
              <Icon
                className={cn(
                  sizeMap[size],
                  'transition-colors absolute',
                  filled
                    ? 'text-yellow-400 fill-yellow-400'
                    : halfFilled
                    ? 'text-yellow-400 fill-yellow-400 clip-path-half'
                    : 'text-gray-300',
                  isInteractive && 'cursor-pointer',
                  disabled && 'opacity-50'
                )}
                aria-hidden="true"
              />
              <Icon
                className={cn(
                  sizeMap[size],
                  'transition-colors',
                  'text-gray-300',
                  isInteractive && 'cursor-pointer',
                  disabled && 'opacity-50'
                )}
              />
            </div>
          )
        },
        [Icon, size, value, hoverValue, allowHalf, tooltips, isInteractive, disabled]
      )

      return (
        <div
          ref={mergeRefs(ref, ratingContainerRef)}
          className={cn(
            'inline-flex items-center gap-1',
            disabled && 'cursor-not-allowed',
            className
          )}
          onMouseMove={isInteractive ? handleMouseMove : undefined}
          onMouseLeave={isInteractive ? handleMouseLeave : undefined}
          onClick={isInteractive ? handleClick : undefined}
          onKeyDown={handleKeyDown}
          role={isInteractive ? 'slider' : 'status'}
          aria-label="Rating"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} out of ${max} stars`}
          tabIndex={isInteractive ? 0 : -1}
          {...props}
        >
          {Array.from({ length: max }, (_, index) => renderIcon(index))}
        </div>
      )
    }
  )
)

// Utility function to merge refs
const mergeRefs = <T extends any>(...refs: Array<React.Ref<T>>): React.Ref<T> => {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T>).current = value
      }
    })
  }
}

Rating.displayName = 'Rating'
```