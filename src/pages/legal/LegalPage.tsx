import { useParams } from "react-router-dom";
import terms from "./terms.md?raw";
import privacy from "./privacy.md?raw";

function mdToHtml(md: string) {
  // bardzo prosty konwerter nagłówków i list (na MVP wystarczy)
  return md
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "<br/>");
}

export default function LegalPage() {
  const { doc } = useParams();
  const content = doc === "privacy" ? privacy : terms;
  return (
    <section className="prose max-w-3xl">
      <div dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />
    </section>
  );
}
