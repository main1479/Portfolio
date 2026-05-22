import type { z } from 'zod';
import type { contactSchema } from '../_lib/contact-schema';

export type ContactFormInput = z.infer<typeof contactSchema>;

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>;

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; errors: ContactFormErrors; message?: string }
  | { status: 'success'; id: string };

export type TopicValue = 'a-b-testing' | 'frontend-build' | 'product-work' | 'something-else';

export type TopicOption = {
  value: TopicValue;
  label: string;
};

export type DirectLinkData = {
  label: string;
  value: string;
  href: string;
  external: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ContactContent = {
  pageIntro: {
    label: string;
    titleLines: readonly string[];
    accentLineIndex: number;
    sub: string;
  };
  aside: {
    heading: string;
    body: string;
    direct: readonly DirectLinkData[];
  };
  form: {
    title: string;
    fields: {
      name: { num: string; label: string; placeholder: string };
      email: { num: string; label: string; placeholder: string };
      topic: { num: string; label: string; options: readonly TopicOption[] };
      message: { num: string; label: string; placeholder: string };
    };
    submit: {
      label: string;
      note: string;
    };
    reset: {
      label: string;
    };
    success: {
      titleLines: readonly string[];
      accentLineIndex: number;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
  };
  faq: {
    sectionIndex: string;
    title: string;
  };
};
