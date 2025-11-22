import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Building2 } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/ro/learning/organization/flow')({
  component: FlowModule,
})

function FlowModule() {
  return (
    <ModulePage
      title="4. Fluxul și Consolidarea"
      description="De ce adunarea tuturor numerelor îți dă răspunsul greșit."
    >
      <Heading>Capcana Dublei Numărări</Heading>

      <Text>
        Acesta este cel mai important concept tehnic. Deoarece banii curg în josul ierarhiei (de la
        Minister la Școală), sunt înregistrați de două ori!
      </Text>

      <ConceptCard title="Vizualizarea Problemei" icon={<ArrowRightLeft className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <Building2 className="h-4 w-4" />
            <span>
              <strong>Ministerul</strong> înregistrează: "Cheltuială: Transfer către Școală (1M
              Lei)"
            </span>
          </div>
          <div className="flex justify-center text-muted-foreground">↓ Banii Se Mișcă ↓</div>
          <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <Building2 className="h-4 w-4" />
            <span>
              <strong>Școala</strong> înregistrează: "Cheltuială: Salarii Profesori (1M Lei)"
            </span>
          </div>
          <p className="text-sm mt-2">
            Dacă le aduni pur și simplu, pare că guvernul a cheltuit 2 Milioane de Lei. Dar doar 1
            Milion a părăsit efectiv sistemul (către profesori).
          </p>
        </div>
      </ConceptCard>

      <Heading>Soluția: Consolidarea</Heading>

      <Text>
        Pentru a repara asta, facem "Consolidare". Găsim toate transferurile interne și le ștergem
        din total. Păstrăm doar plata finală.
      </Text>

      <Quiz
        id="ro-flow-1"
        question='Când ne uităm la "Bugetul General Consolidat", ce se întâmplă cu transferurile dintre Minister și o Școală?'
        options={[
          { id: 'a', text: 'Sunt numărate de două ori pentru a arăta importanța.', isCorrect: false },
          {
            id: 'b',
            text: 'Sunt eliminate pentru a evita dubla numărare.',
            isCorrect: true,
          },
          { id: 'c', text: 'Sunt taxate.', isCorrect: false },
        ]}
        explanation="Corect! Eliminăm transferul pentru a putea vedea dimensiunea reală a cheltuielilor publice."
      />
    </ModulePage>
  )
}
