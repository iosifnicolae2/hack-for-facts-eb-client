import { createFileRoute } from '@tanstack/react-router'
import { Scale } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { ConceptCard } from '@/components/learning/InteractiveComponents'
import { BudgetFlowDiagram } from '@/components/learning/BudgetFlowDiagram'

export const Route = createFileRoute('/en/learning/organization/hierarchy')({
  component: HierarchyModule,
})

function HierarchyModule() {
  return (
    <ModulePage
      title="3. The Hierarchy"
      description="Who is in charge? The chain of command."
    >
      <Heading>The "Ordonatori de Credite"</Heading>

      <Text>
        In the Romanian system, no one can touch money without being a "Credit Authorizer". There
        is a strict 3-level hierarchy.
      </Text>

      <ConceptCard title="The Pyramid of Power" icon={<Scale className="h-5 w-5" />}>
        <div className="relative border-l-2 border-primary/20 pl-6 space-y-6 my-4">
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <strong className="text-lg">Principal (Ordonator Principal)</strong>
            <p className="text-muted-foreground">Ministers, Mayors, County Presidents.</p>
            <p className="text-sm mt-1">
              They get the budget directly from the Law. They decide how to split it among
              subordinates.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary/70 text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <strong className="text-lg">Secondary (Ordonator Secundar)</strong>
            <p className="text-muted-foreground">Heads of large regional departments.</p>
            <p className="text-sm mt-1">
              Example: A County School Inspectorate. They receive money from the Ministry and pass
              it to schools.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary/40 text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <strong className="text-lg">Tertiary (Ordonator Terțiar)</strong>
            <p className="text-muted-foreground">School Principals, Hospital Managers.</p>
            <p className="text-sm mt-1">
              <strong>Crucial:</strong> These are the people who actually sign the contracts and
              make the payments!
            </p>
          </div>
        </div>
      </ConceptCard>

      <BudgetFlowDiagram />
    </ModulePage>
  )
}
