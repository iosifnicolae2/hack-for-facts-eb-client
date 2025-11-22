import { createFileRoute } from '@tanstack/react-router'
import { PiggyBank } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/ro/learning/fundamentals/structure')({
  component: StructureModule,
})

function StructureModule() {
  return (
    <ModulePage
      title="2. Structura"
      description="Venituri vs Cheltuieli: Anatomia banilor publici."
    >
      <Heading>De unde vin banii?</Heading>

      <Text>
        Guvernul colectează bani în principal prin taxe. În România, cele mai mari surse sunt TVA
        (pe lucrurile pe care le cumperi), Impozitul pe Venit (pe salariul tău) și Contribuțiile
        Sociale (pentru pensii și sănătate).
      </Text>

      <Heading>Unde se duc? (Clasificația Economică)</Heading>

      <Text>
        Când ne uităm la cheltuieli, putem întreba "Ce cumpărăm?". Aceasta se numește{' '}
        <strong>Clasificația Economică</strong>.
      </Text>

      <ConceptCard title="Marile Categorii" icon={<PiggyBank className="h-5 w-5" />}>
        <div className="space-y-3">
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Titlul 10: Personal</strong>
            <span className="text-sm">
              Salarii pentru toți angajații publici (medici, profesori, polițiști).
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Titlul 20: Bunuri și Servicii</strong>
            <span className="text-sm">
              Facturile: Electricitate, căldură, medicamente în spitale, hârtie pentru școli.
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Titlul 57: Asistență Socială</strong>
            <span className="text-sm">
              Bani dați oamenilor: Pensii, alocații pentru copii, ajutoare de handicap.
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Titlul 71: Investiții</strong>
            <span className="text-sm">Construcții: Drumuri, poduri, aripi noi pentru spitale.</span>
          </div>
        </div>
      </ConceptCard>

      <Quiz
        id="ro-structure-1"
        question="Un spital cumpără un aparat RMN nou. Ce categorie este aceasta?"
        options={[
          { id: 'a', text: 'Titlul 20 (Bunuri și Servicii)', isCorrect: false },
          { id: 'b', text: 'Titlul 71 (Investiții/Active Fixe)', isCorrect: true },
          { id: 'c', text: 'Titlul 10 (Personal)', isCorrect: false },
        ]}
        explanation="Cumpărarea unui aparat este o Investiție (Activ Fix) pentru că durează mulți ani. Cumpărarea electricității pentru a-l folosi ar fi Bunuri și Servicii."
      />
    </ModulePage>
  )
}
