import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { mockFAQs } from '@/lib/mock-data';

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = mockFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-background-subtle py-12">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Find answers to common questions</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Accordion className="w-full">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem key={faq.id} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <p className="text-center text-muted-foreground">No FAQs found matching your search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
