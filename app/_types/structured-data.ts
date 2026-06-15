/**
 * Minimal types for the schema.org JSON-LD objects we emit.
 * Kept intentionally light — we model only the fields we actually set,
 * rather than pulling in a full schema.org type package as a dependency.
 */

/** Any schema.org node. The `@type` (and optional `@context`) plus arbitrary fields. */
export type SchemaNode = {
  '@context'?: 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
};

/** A single crumb in a breadcrumb trail. */
export type Breadcrumb = {
  name: string;
  /** Absolute or root-relative path; builder resolves to an absolute URL. */
  path: string;
};

/** Accepted by the JsonLd component — one node or several. */
export type JsonLdData = SchemaNode | SchemaNode[];
