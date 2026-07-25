'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQItem } from '@/types';

interface AccordionProps {
  items: FAQItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl border-[3px] border-[#111111] bg-white shadow-[4px_4px_0px_0px_#111111] overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left font-extrabold text-lg md:text-xl text-[#111111] hover:bg-[#FFD43B]/10 transition-colors cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <div
                className={cn(
                  'p-1.5 rounded-lg border-2 border-[#111111] bg-[#FFD43B] transition-transform duration-300',
                  isOpen && 'rotate-180 bg-[#FF4D6D] text-white'
                )}
              >
                <ChevronDown className="w-5 h-5 stroke-[3]" />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-5 pt-0 text-base md:text-lg text-[#111111]/80 font-medium border-t-2 border-dashed border-[#111111]/20 mt-1">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
