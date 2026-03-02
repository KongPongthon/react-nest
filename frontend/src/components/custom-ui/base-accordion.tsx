import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type BaseAccordionType = "single" | "multiple";

interface BaseAccordionProps {
  items: {
    value: string;
    title: string;
    content: string;
    disabled?: boolean;
  }[];
  border?: boolean;
  className?: string;
  type?: BaseAccordionType;
  defaultValue?: string | string[];
}

const accordionClassName = (border: boolean, className: string) =>
  cn("max-w-lg rounded-lg  w-full", border ? "border" : "", className);

const BaseAccordion = ({
  items,
  border = true,
  className = "",
  type = "single",
  defaultValue,
}: BaseAccordionProps) => {
  const sharedProps = {
    collapsible: true as const,
    className: accordionClassName(border, className),
  };

  return type === "single" ? (
    <Accordion
      type="single"
      {...sharedProps}
      defaultValue={defaultValue as string}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="border-b px-4 last:border-b-0"
          disabled={item.disabled}
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ) : (
    <Accordion
      type="multiple"
      {...sharedProps}
      defaultValue={defaultValue as string[]}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="border-b px-4 last:border-b-0"
          disabled={item.disabled}
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
export default BaseAccordion;
