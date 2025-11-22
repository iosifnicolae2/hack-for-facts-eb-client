import { createFileRoute } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, Flashcard, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/en/learning/fundamentals/basics')({
  component: BasicsModule,
})

function BasicsModule() {
  return (
    <ModulePage
      title="1. Budget Basics"
      description="Start here: What is the public budget and why should you care?"
    >
      <Heading>The Public Wallet</Heading>

      <Text>
        Imagine the entire country as a giant household. The "Public Budget" is simply the plan
        for how this household earns money and how it spends it. But unlike a regular household,
        this plan is a <strong>Law</strong> passed by Parliament.
      </Text>

      <ConceptCard title="It is a Law, not a Suggestion" icon={<FileText className="h-5 w-5" />}>
        <p>The "State Budget Law" sets strict limits. It tells the government:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>"You expect to collect X amount." (Revenues)</li>
          <li>"You are ALLOWED to spend up to Y amount." (Allocations)</li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Key concept: An allocation is a <strong>limit</strong>, not a guarantee. If a ministry
          is lazy or incompetent, they might not spend the money allocated to them!
        </p>
      </ConceptCard>

      <Heading>Allocations vs. Payments</Heading>

      <Text>
        This is the most common confusion. Just because money is "in the budget" doesn't mean it
        has been spent. We track two main things:
      </Text>

      <Flashcard
        term="Prevederi (Allocations)"
        definition='The maximum amount approved by Parliament. "You can spend UP TO this amount."'
      />

      <Flashcard
        term="Plăți (Payments)"
        definition="The actual cash leaving the Treasury account. This is the real money being used."
      />

      <Quiz
        id="en-basics-1"
        question='If the news says "Education has a budget of 50 Billion Lei", what does that mean?'
        options={[
          { id: 'a', text: '50 Billion Lei has already been spent on schools.', isCorrect: false },
          {
            id: 'b',
            text: 'The Ministry is allowed to spend up to 50 Billion Lei this year.',
            isCorrect: true,
          },
          { id: 'c', text: 'The Ministry has 50 Billion Lei in cash in a safe.', isCorrect: false },
        ]}
        explanation="Correct! It is a spending limit (Allocation). Whether they actually spend it depends on their ability to execute projects."
      />
    </ModulePage>
  )
}
