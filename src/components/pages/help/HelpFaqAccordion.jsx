import Accordion from "@/components/ui/Accordion";
export default function HelpFaqAccordion({ items,escalation }) {
  return <Accordion items={items} helpaccordian={true} escalation={escalation}/>;
}