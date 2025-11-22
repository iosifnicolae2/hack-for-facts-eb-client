import { createFileRoute } from '@tanstack/react-router'
import { Scale } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/ro/learning/organization/hierarchy')({
  component: HierarchyModule,
})

function HierarchyModule() {
  return (
    <ModulePage
      title="3. Ierarhia"
      description="Cine este șeful? Lanțul de comandă."
    >
      <Heading>Ordonatorii de Credite</Heading>

      <Text>
        În sistemul românesc, nimeni nu poate atinge banii fără a fi "Ordonator de Credite". Există
        o ierarhie strictă pe 3 niveluri.
      </Text>

      <ConceptCard title="Piramida Puterii" icon={<Scale className="h-5 w-5" />}>
        <div className="relative border-l-2 border-primary/20 pl-6 space-y-6 my-4">
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <strong className="text-lg">Principal (Ordonator Principal)</strong>
            <p className="text-muted-foreground">
              Miniștri, Primari, Președinți de Consilii Județene.
            </p>
            <p className="text-sm mt-1">
              Ei primesc bugetul direct prin Lege. Ei decid cum să îl împartă subordonaților.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary/70 text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <strong className="text-lg">Secundar (Ordonator Secundar)</strong>
            <p className="text-muted-foreground">Șefii departamentelor regionale mari.</p>
            <p className="text-sm mt-1">
              Exemplu: Un Inspectorat Școlar Județean. Ei primesc bani de la Minister și îi dau
              școlilor.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-0 bg-primary/40 text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <strong className="text-lg">Terțiar (Ordonator Terțiar)</strong>
            <p className="text-muted-foreground">Directorii de Școli, Managerii de Spitale.</p>
            <p className="text-sm mt-1">
              <strong>Crucial:</strong> Aceștia sunt oamenii care semnează efectiv contractele și
              fac plățile!
            </p>
          </div>
        </div>
      </ConceptCard>
    </ModulePage>
  )
}
