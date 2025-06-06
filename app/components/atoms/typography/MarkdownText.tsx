import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function MarkdownText({ text }: { text: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-1 prose-hr:my-4">
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(text, { async: false })) }} />
    </div>
  );
}
