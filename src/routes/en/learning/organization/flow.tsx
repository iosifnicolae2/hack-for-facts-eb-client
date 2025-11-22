import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Building2 } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/en/learning/organization/flow')({
  component: FlowModule,
})

function FlowModule() {
  return (
    <ModulePage
      title="4. The Flow & Consolidation"
      description="Why adding up all the numbers gives you the wrong answer."
    >
      <Heading>The Trap of Double Counting</Heading>

      <Text>
        This is the most important technical concept. Because money flows down the hierarchy (from
        Ministry to School), it gets recorded twice!
      </Text>

      <ConceptCard title="Visualizing the Problem" icon={<ArrowRightLeft className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <Building2 className="h-4 w-4" />
            <span>
              <strong>Ministry</strong> records: "Expense: Transfer to School (1M Lei)"
            </span>
          </div>
          <div className="flex justify-center text-muted-foreground">↓ Money Moves ↓</div>
          <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <Building2 className="h-4 w-4" />
            <span>
              <strong>School</strong> records: "Expense: Teacher Salaries (1M Lei)"
            </span>
          </div>
          <p className="text-sm mt-2">
            If you just sum them up, it looks like the government spent 2 Million Lei. But only 1
            Million actually left the system (to the teachers).
          </p>
        </div>
      </ConceptCard>

      <Heading>The Solution: Consolidation</Heading>

      <Text>
        To fix this, we perform "Consolidation". We find all the internal transfers and delete
        them from the total. We only keep the final payment.
      </Text>

      <Quiz
        id="en-flow-1"
        question='When looking at the "General Consolidated Budget", what happens to transfers between the Ministry and a School?'
        options={[
          { id: 'a', text: 'They are counted twice to show importance.', isCorrect: false },
          {
            id: 'b',
            text: 'They are eliminated (removed) to avoid double counting.',
            isCorrect: true,
          },
          { id: 'c', text: 'They are taxed.', isCorrect: false },
        ]}
        explanation="Correct! We eliminate the transfer so we can see the true size of public spending."
      />
    </ModulePage>
  )
}
