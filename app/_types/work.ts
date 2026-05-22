export type WorkProject = {
  slug: string;
  num: string;
  title: string;
  summary: string;
  tags: readonly string[];
  featured: boolean;
  order: number;
  year?: string;
  type?: 'own' | 'client' | 'agency';
};
