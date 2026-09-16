import type { FAQ } from "@/types";
import Icon from "./Icon";
export default function FAQSection({ faqs }: { faqs: FAQ[] }) {
 if (!faqs.length) return null;
 return <section className="section container faq-section" aria-labelledby="faq-title"><div><p className="eyebrow">A LITTLE GUIDANCE</p><h2 id="faq-title">Before your<br/>next escape.</h2><p>Good questions. Clear answers.<br/>And a real person when you need one.</p><a href="/contact" className="text-link">Talk to our team<Icon name="arrow" size={18}/></a></div><div className="faq-list">{faqs.map(f=><details key={f.id} name="home-faq"><summary>{f.question}<Icon name="plus" size={20}/></summary><div className="faq-answer"><p>{f.answer}</p></div></details>)}</div></section>;
}
