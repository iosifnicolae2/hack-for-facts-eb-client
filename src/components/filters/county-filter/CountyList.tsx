import { useMemo, useState } from 'react'
import { BaseListProps } from '../base-filter/interfaces'
import { ListContainerSimple } from '../base-filter/ListContainerSimple'
import { ListOption } from '../base-filter/ListOption'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getUniqueCounties } from '@/lib/api/dataDiscovery'

export function CountyList({ selectedOptions, toggleSelect, className }: BaseListProps) {
  const [search, setSearch] = useState('')
  const { data: counties = [], isLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: getUniqueCounties,
    staleTime: 1000 * 60 * 60 * 24,
  })

  const options = useMemo(() => {
    const mapped = counties.map((c) => ({ id: c.code, label: `${c.name} (${c.code})` }))
    if (!search) return mapped
    const term = search.toLowerCase()
    return mapped.filter((o) => o.label.toLowerCase().includes(term))
  }, [counties, search])

  const rowHeight = 40

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"
        placeholder="Search counties..."
      />
      <ListContainerSimple height={(isLoading ? 6 : options.length) * rowHeight} className="min-h-[10rem]">
        {(isLoading ? Array.from({ length: 6 }).map((_, i) => ({ id: `loading-${i}`, label: 'Loading...' })) : options).map(
          (option, index) => (
            <ListOption
              key={option.id}
              onClick={() => toggleSelect(option)}
              uniqueIdPart={option.id}
              label={option.label}
              selected={selectedOptions.some((so) => so.id === option.id)}
              optionHeight={rowHeight}
              optionStart={index * rowHeight}
            />
          ),
        )}
      </ListContainerSimple>
    </div>
  )
}


