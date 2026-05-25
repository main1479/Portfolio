'use client';

import { useCallback, useRef, useState } from 'react';
import { TopicChips } from './TopicChips';
import { FormSuccess } from './FormSuccess';
import { Arrow } from '../../../_components/Arrow/Arrow';
import { Magnetic } from '../../../_components/Magnetic/Magnetic';
import { contactSchema } from '../../../_lib/contact-schema';
import type {
  ContactContent,
  ContactFormErrors,
  ContactFormState,
  TopicValue,
} from '../../../_types/contact';
import styles from './_ContactForm.module.scss';

type Props = { content: ContactContent['form'] };

type FieldLabel = { num: string; label: string; placeholder?: string };

function FieldInput({
  id,
  field,
  type = 'text',
  autoComplete,
  textarea,
  error,
}: {
  id: string;
  field: FieldLabel;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        <span className={styles.num}>{field.num}</span>
        {field.label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          placeholder={field.placeholder}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={field.placeholder}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
        />
      )}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ content }: Props) {
  const [state, setState] = useState<ContactFormState>({ status: 'idle' });
  const [topic, setTopic] = useState<TopicValue | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state.status === 'submitting') return;
      setFormError(null);

      const form = e.currentTarget;
      const formData = new FormData(form);
      const raw = {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        topic: String(formData.get('topic') ?? ''),
        message: String(formData.get('message') ?? ''),
        company: String(formData.get('company') ?? ''),
      };

      const parsed = contactSchema.safeParse(raw);
      if (!parsed.success) {
        const errors: ContactFormErrors = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0];
          if (typeof field === 'string' && field !== 'company') {
            errors[field as keyof ContactFormErrors] = issue.message;
          }
        }
        setState({ status: 'error', errors });
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          form.querySelector<HTMLElement>(`[name="${firstErrorField}"]`)?.focus();
        }
        return;
      }

      setState({ status: 'submitting' });
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
          signal: controller.signal,
        });
        const json: unknown = await res.json();

        if (!res.ok) {
          if (
            typeof json === 'object' &&
            json !== null &&
            'error' in json &&
            (json as Record<string, unknown>).error === 'VALIDATION'
          ) {
            const fieldErrors =
              (json as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
            const errors: ContactFormErrors = {};
            for (const [k, msgs] of Object.entries(fieldErrors)) {
              if (k !== 'company') {
                errors[k as keyof ContactFormErrors] = msgs[0];
              }
            }
            setState({ status: 'error', errors });
          } else if (
            typeof json === 'object' &&
            json !== null &&
            'error' in json &&
            (json as Record<string, unknown>).error === 'CONTACT_NOT_CONFIGURED'
          ) {
            setFormError(
              "Reach me directly at m.main2402@gmail.com — the form's offline right now.",
            );
            setState({ status: 'error', errors: {} });
          } else {
            setFormError(
              'Something went wrong on my end. Try again, or email me directly at m.main2402@gmail.com.',
            );
            setState({ status: 'error', errors: {} });
          }
          return;
        }

        const data = json as { success: boolean; data?: { id: string } };
        setState({ status: 'success', id: data.data?.id ?? 'unknown' });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setFormError("Couldn't reach the server. Check your connection and try again.");
        setState({ status: 'error', errors: {} });
      }
    },
    [state.status],
  );

  const onReset = useCallback(() => {
    formRef.current?.reset();
    setTopic('');
    setState({ status: 'idle' });
    setFormError(null);
  }, []);

  if (state.status === 'success') {
    return <FormSuccess content={content.success} />;
  }

  const errors = state.status === 'error' ? state.errors : {};

  return (
    <form
      ref={formRef}
      className={styles.form}
      noValidate
      onSubmit={onSubmit}
      aria-busy={state.status === 'submitting'}
    >
      <div className={styles.head}>
        <span className={styles.title}>{content.title}</span>
        <Magnetic>
          <button type="button" className={styles.reset} onClick={onReset}>
            {content.reset.label}
          </button>
        </Magnetic>
      </div>

      <div className={styles.row}>
        <FieldInput
          id="name"
          field={content.fields.name}
          type="text"
          autoComplete="name"
          error={errors.name}
        />
        <FieldInput
          id="email"
          field={content.fields.email}
          type="email"
          autoComplete="email"
          error={errors.email}
        />
      </div>

      <div className={styles.field}>
        <label id="topic-label">
          <span className={styles.num}>{content.fields.topic.num}</span>
          {content.fields.topic.label}
        </label>
        <TopicChips
          options={content.fields.topic.options}
          value={topic}
          onChange={setTopic}
          error={errors.topic}
          labelledBy="topic-label"
        />
        <input type="hidden" name="topic" value={topic} />
        {errors.topic && (
          <p className={styles.error} id="topic-error" role="alert">
            {errors.topic}
          </p>
        )}
      </div>

      <FieldInput id="message" field={content.fields.message} textarea error={errors.message} />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company (leave blank)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <div className={styles.submit}>
        <span className={styles.submitNote}>{content.submit.note}</span>
        <Magnetic>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={state.status === 'submitting'}
          >
            <span>{state.status === 'submitting' ? 'Sending…' : content.submit.label}</span>
            <span className={styles.submitArrow} aria-hidden="true">
              <Arrow size={14} strokeWidth={1.6} />
            </span>
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
