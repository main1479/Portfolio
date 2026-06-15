import type { JsonLdData } from '../../_types/structured-data';

/**
 * Renders schema.org JSON-LD as a server-rendered <script> so it is present in
 * the initial HTML that crawlers receive (not injected after hydration).
 *
 * The `<` → `<` replacement prevents a `</script>` sequence inside the
 * serialised data from breaking out of the script element (a standard XSS
 * guard for inline JSON-LD).
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // Content is our own serialised, escaped schema data — not user input.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
