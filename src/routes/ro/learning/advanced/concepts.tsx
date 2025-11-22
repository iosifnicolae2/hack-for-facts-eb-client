import { createFileRoute } from '@tanstack/react-router'
import { TrendingDown } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/ro/learning/advanced/concepts')({
  component: AdvancedModule,
})

function AdvancedModule() {
  return (
    <ModulePage
      title="5. Concepte Avansate"
      description="Deficit, Datorie și conexiunea UE."
    >
      <Heading>Deficit vs. Datorie</Heading>

      <Text>Politicienii le confundă adesea, dar tu nu ar trebui.</Text>

      <ConceptCard title="Diferența" icon={<TrendingDown className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-background">
            <strong className="text-lg block mb-2">Deficit (Fluxul)</strong>
            <p className="text-sm">
              Se întâmplă într-un <strong>singur an</strong>.
            </p>
            <p className="text-sm mt-2">
              "Anul acesta am cheltuit 100 dar am câștigat doar 90. Avem un deficit de 10."
            </p>
          </div>
          <div className="p-4 border rounded bg-background">
            <strong className="text-lg block mb-2">Datorie (Stocul)</strong>
            <p className="text-sm">
              Este <strong>istoria totală</strong>.
            </p>
            <p className="text-sm mt-2">
              "Am împrumutat 10 în fiecare an timp de 10 ani. Acum Datoria noastră Publică este
              100."
            </p>
          </div>
        </div>
      </ConceptCard>

      <Heading>Fonduri Europene (FEN)</Heading>

      <Text>
        România primește miliarde de la UE. Acestea au coduri speciale (Titlul 58, 60, 61). Adesea,
        guvernul trebuie să cheltuiască banii mai întâi, iar UE îi rambursează mai târziu. Dacă
        proiectele sunt proaste sau ilegale, UE refuză să plătească, iar costul cade pe bugetul
        României (aceasta se numește "Corecție").
      </Text>
    </ModulePage>
  )
}
