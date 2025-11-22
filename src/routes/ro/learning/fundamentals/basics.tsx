import { createFileRoute } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { ModulePage, Heading, Text } from '@/components/learning/ModulePage'
import { Quiz, Flashcard, ConceptCard } from '@/components/learning/InteractiveComponents'

export const Route = createFileRoute('/ro/learning/fundamentals/basics')({
  component: BasicsModule,
})

function BasicsModule() {
  return (
    <ModulePage
      title="1. Bazele Bugetului"
      description="Începe aici: Ce este bugetul public și de ce ar trebui să îți pese?"
    >
      <Heading>Portofelul Public</Heading>

      <Text>
        Imaginează-ți întreaga țară ca o gospodărie uriașă. "Bugetul Public" este pur și simplu
        planul pentru cum câștigă această gospodărie bani și cum îi cheltuiește. Dar, spre
        deosebire de o gospodărie obișnuită, acest plan este o <strong>Lege</strong> aprobată de
        Parlament.
      </Text>

      <ConceptCard title="Este o Lege, nu o Sugestie" icon={<FileText className="h-5 w-5" />}>
        <p>"Legea Bugetului de Stat" stabilește limite stricte. Ea spune guvernului:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>"Te aștepți să colectezi suma X." (Venituri)</li>
          <li>"Ai VOIE să cheltuiești până la suma Y." (Prevederi/Alocări)</li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Concept cheie: O alocare este o <strong>limită</strong>, nu o garanție. Dacă un minister
          este leneș sau incompetent, s-ar putea să nu cheltuiască banii alocați!
        </p>
      </ConceptCard>

      <Heading>Prevederi vs. Plăți</Heading>

      <Text>
        Aceasta este cea mai comună confuzie. Doar pentru că banii sunt "în buget" nu înseamnă că
        au fost cheltuiți. Urmărim două lucruri principale:
      </Text>

      <Flashcard
        term="Prevederi (Alocări)"
        definition='Suma maximă aprobată de Parlament. "Poți cheltui PÂNĂ LA această sumă."'
      />

      <Flashcard
        term="Plăți Efectuate"
        definition="Numerarul care părăsește efectiv contul Trezoreriei. Aceștia sunt banii reali utilizați."
      />

      <Quiz
        id="ro-basics-1"
        question='Dacă la știri se spune "Educația are un buget de 50 de Miliarde de Lei", ce înseamnă asta?'
        options={[
          { id: 'a', text: '50 de Miliarde au fost deja cheltuite pe școli.', isCorrect: false },
          {
            id: 'b',
            text: 'Ministerul are voie să cheltuiască până la 50 de Miliarde anul acesta.',
            isCorrect: true,
          },
          { id: 'c', text: 'Ministerul are 50 de Miliarde cash într-un seif.', isCorrect: false },
        ]}
        explanation="Corect! Este o limită de cheltuieli (Alocare). Dacă îi cheltuie efectiv depinde de capacitatea lor de a executa proiecte."
      />
    </ModulePage>
  )
}
