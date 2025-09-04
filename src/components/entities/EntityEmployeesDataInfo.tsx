import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function EntityEmployeesDataInfo() {
    return (
        <Card className="bg-muted/30">
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /><span>Despre Date și Metodologie</span></CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-6">Informațiile prezentate au caracter informativ și reprezintă o imagine a personalului din aparatele proprii ale primăriilor și consiliilor județene din România, la nivelul lunii Septembrie 2025. Sursa datelor este Guvernul României, pe baza raportărilor prefecturilor.</p>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Ce înseamnă 'Limită Legală Simulată'?</AccordionTrigger>
                        <AccordionContent className="pb-4">Reprezintă un prag calculat pe baza unei propuneri de reducere cu <strong>15%</strong> a posturilor ocupate (ceea ce corespunde unei reduceri cu 45% a numărului maxim teoretic permis de O.U.G. 63/2010). Este o simulare pentru a evalua impactul unor posibile reforme, nu o limită legală în vigoare.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Sunt datele 100% exacte?</AccordionTrigger>
                        <AccordionContent className="pb-4">Datele se bazează pe raportări multiple și, conform notei oficiale, s-ar putea înregistra un grad de eroare de aproximativ <strong>±2%</strong> la nivelul întregii țări din cauza unor posibile diferențe de raportare.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Care e diferența dintre 'Posturi Ocupate' și 'Numărul Maxim de Posturi'?</AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Posturi Ocupate:</strong> Numărul efectiv de angajați.</li>
                                <li><strong>Posturi în Organigramă:</strong> Totalul posturilor aprobate de consiliul local, inclusiv cele vacante.</li>
                                <li><strong>Număr Maxim Legal:</strong> Limita superioară de posturi pe care o entitate ar putea să o aibă, conform populației. Majoritatea organigramelor sunt sub acest maxim.</li>
                            </ul>
                            <p className="mt-2 text-xs text-muted-foreground">La nivel național, aproximativ 32% din totalul posturilor prevăzute de lege sunt fie neînființate, fie vacante.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Ce entități sunt incluse în analiză?</AccordionTrigger>
                        <AccordionContent className="pb-4">Analiza include toate UAT-urile (comune, orașe, municipii), Sectoarele Municipiului București, Consiliile Județene și Primăria Generală a Municipiului București.</AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="mt-6">
                    <Button asChild variant="link" className="px-0 h-auto">
                        <a href="https://gov.ro/aal/" target="_blank" rel="noopener noreferrer" className="text-sm">Vezi Sursa Oficială pe gov.ro/aal<ExternalLink className="h-4 w-4 ml-1" /></a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}