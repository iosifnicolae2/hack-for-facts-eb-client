import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookMarked } from 'lucide-react'

const legendItems = [
  { term: 'G', description: 'Nr. max. posturi cf. pct. 1 din anexa la O.U.G nr. 63/2010' },
  { term: 'H', description: 'Reducere cu 40% nr. max posturi (G * 0.6)' },
  { term: 'I', description: 'Reducere cu 45% nr. max posturi (G * 0.55)' },
  { term: 'J', description: 'Posturi pt. evidența populației' },
  { term: 'K', description: 'Posturi pt. poliţia locală' },
  { term: 'L', description: 'Posturi pt. poliţia locală (simulare 1/1200 locuitori)' },
  { term: 'M', description: 'Posturi pt. implementare proiecte europene' },
  { term: 'N', description: 'Posturi pt. șoferi microbuze şcolare' },
  { term: 'O', description: 'Posturi pt. post-implementare proiecte europene' },
  { term: 'Q', description: 'TOTAL CU REDUCERE 40% (H + J + L + M + N + O)' },
  { term: 'R', description: 'TOTAL CU REDUCERE 45% (I + J + L + M + N + O)' },
]

export function CalculationLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BookMarked className="h-5 w-5" />
          <span>Legendă Calcul (Coloane Sursă XLS)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-xs">
          {legendItems.map(item => (
            <div key={item.term} className="flex items-start gap-2">
              <span className="font-bold text-primary">{item.term}:</span>
              <span className="text-muted-foreground">{item.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
