import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { TableIcon, BarChart2Icon } from 'lucide-react'
import { t } from '@lingui/core/macro';

const viewOptions = [
  { id: 'table', label: t`Table`, icon: TableIcon },
  { id: 'chart', label: t`Chart`, icon: BarChart2Icon },
] as const

interface Props {
  value: 'table' | 'chart'
  onChange: (value: 'table' | 'chart') => void
}

export function EntityAnalyticsViewToggle({ value, onChange }: Props) {
  const handleValueChange = (newValue: string) => {
    if (newValue === 'table' || newValue === 'chart') onChange(newValue)
  }

  return (
    <RadioGroup value={value} className="flex space-x-2" onValueChange={handleValueChange}>
      {viewOptions.map((option) => {
        const isSelected = value === option.id
        const Icon = option.icon
        return (
          <Label
            key={option.id}
            htmlFor={`ea-view-${option.id}`}
            className={cn(
              'flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center justify-center',
              isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <RadioGroupItem value={option.id} id={`ea-view-${option.id}`} className="sr-only" />
            <Icon className="h-4 w-4 mr-2" />
            {option.label}
          </Label>
        )
      })}
    </RadioGroup>
  )
}


