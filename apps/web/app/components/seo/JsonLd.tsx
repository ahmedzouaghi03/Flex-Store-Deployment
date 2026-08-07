// Renders a schema.org JSON-LD block. `<` is escaped so a value containing
// "</script>" can't prematurely close the tag.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
