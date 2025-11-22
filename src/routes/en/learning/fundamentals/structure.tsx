import { createFileRoute } from '@tanstack/react-router'
import { PiggyBank } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/en/learning/fundamentals/structure')({
  component: StructureModule,
})

function StructureModule() {
  return (
    <ModulePage
      title="2. The Structure"
      description="Revenues vs Expenses: The anatomy of public money."
    >
      <Heading>Where does the money come from?</Heading>

      <Text>
        The government collects money primarily through taxes. In Romania, the biggest sources are
        VAT (on things you buy), Income Tax (on your salary), and Social Contributions (for
        pensions and health).
      </Text>

      <Heading>Where does it go? (Economic Classification)</Heading>

      <Text>
        When we look at expenses, we can ask "What are we buying?". This is called the{' '}
        <strong>Economic Classification</strong>.
      </Text>

      <ConceptCard title="The Big Buckets" icon={<PiggyBank className="h-5 w-5" />}>
        <div className="space-y-3">
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Title 10: Personnel</strong>
            <span className="text-sm">
              Salaries for all public employees (doctors, teachers, police, clerks).
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Title 20: Goods & Services</strong>
            <span className="text-sm">
              The bills: Electricity, heating, medicine in hospitals, paper for schools.
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Title 57: Social Assistance</strong>
            <span className="text-sm">
              Money given to people: Pensions, child allowances, disability benefits.
            </span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <strong className="text-primary block">Title 71: Investments</strong>
            <span className="text-sm">
              Building things: Roads, bridges, new wings for hospitals.
            </span>
          </div>
        </div>
      </ConceptCard>

      <Quiz
        id="en-structure-1"
        question="A hospital buys new MRI machines. Which category is this?"
        options={[
          { id: 'a', text: 'Title 20 (Goods & Services)', isCorrect: false },
          { id: 'b', text: 'Title 71 (Investments/Capital Assets)', isCorrect: true },
          { id: 'c', text: 'Title 10 (Personnel)', isCorrect: false },
        ]}
        explanation="Buying a machine is an Investment (Capital Asset) because it lasts for many years. Buying electricity to run it would be Goods & Services."
      />
    </ModulePage>
  )
}
