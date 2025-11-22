import { createFileRoute } from '@tanstack/react-router'
import { TrendingDown } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/en/learning/advanced/concepts')({
  component: AdvancedModule,
})

function AdvancedModule() {
  return (
    <ModulePage
      title="5. Advanced Concepts"
      description="Deficit, Debt, and the EU connection."
    >
      <Heading>Deficit vs. Debt</Heading>

      <Text>Politicians often mix these up, but you shouldn't.</Text>

      <ConceptCard title="The Difference" icon={<TrendingDown className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-background">
            <strong className="text-lg block mb-2">Deficit (The Flow)</strong>
            <p className="text-sm">
              It happens in <strong>one year</strong>.
            </p>
            <p className="text-sm mt-2">
              "This year we spent 100 but only earned 90. We have a deficit of 10."
            </p>
          </div>
          <div className="p-4 border rounded bg-background">
            <strong className="text-lg block mb-2">Debt (The Stock)</strong>
            <p className="text-sm">
              It is the <strong>total history</strong>.
            </p>
            <p className="text-sm mt-2">
              "We borrowed 10 every year for 10 years. Now our Public Debt is 100."
            </p>
          </div>
        </div>
      </ConceptCard>

      <Heading>European Funds (FEN)</Heading>

      <Text>
        Romania receives billions from the EU. These have special codes (Title 58, 60, 61). Often,
        the government must spend the money first, and the EU reimburses it later. If the projects
        are bad or illegal, the EU refuses to pay, and the cost falls on the Romanian budget (this
        is called a "Correction").
      </Text>
    </ModulePage>
  )
}
