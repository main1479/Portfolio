import type { CvContent } from '../../../_types/cv';
import styles from './_CvDocument.module.scss';

type Props = { content: CvContent };

export function CvDocument({ content }: Props) {
  const { header, about, stats, experience, featuredProjects, clientWork, skills, awards } =
    content;

  return (
    <article className={styles.doc} aria-label="Resume — Mainul Islam">
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <h1 className={styles.name}>{header.name}</h1>
          <p className={styles.role}>{header.role}</p>
        </div>
        <ul className={styles.contact} aria-label="Contact">
          <li>
            <span className={styles.contactLabel}>Email</span>
            <a href={`mailto:${header.contact.email}`}>{header.contact.email}</a>
          </li>
          <li>
            <span className={styles.contactLabel}>Portfolio</span>
            <a href={`https://${header.contact.portfolio}`}>{header.contact.portfolio}</a>
          </li>
          <li>
            <span className={styles.contactLabel}>GitHub</span>
            <a href={`https://${header.contact.github}`}>{header.contact.github}</a>
          </li>
          <li>
            <span className={styles.contactLabel}>LinkedIn</span>
            <a href={`https://${header.contact.linkedin}`}>{header.contact.linkedin}</a>
          </li>
          <li>
            <span className={styles.contactLabel}>Phone</span>
            <span>{header.contact.phone}</span>
          </li>
        </ul>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>About</h2>
        <p className={styles.about}>{about}</p>
        <ul className={styles.stats} aria-label="Career stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Experience</h2>
        <div className={styles.entries}>
          {experience.map((xp) => (
            <div key={xp.role + xp.dates} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>
                  {xp.role}
                  {xp.org && (
                    <>
                      {' '}
                      <span className={styles.entryOrg}>· {xp.org}</span>
                    </>
                  )}
                </h3>
                <p className={styles.entryMeta}>
                  {xp.dates}
                  {xp.location && (
                    <>
                      <span aria-hidden="true"> · </span>
                      {xp.location}
                    </>
                  )}
                </p>
              </div>
              <ul className={styles.bullets}>
                {xp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Featured projects</h2>
        <div className={styles.entries}>
          {featuredProjects.map((p) => (
            <div key={p.title} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>
                  {p.title} <span className={styles.entryOrg}>— {p.tagline}</span>
                </h3>
                <p className={styles.entryMeta}>
                  {p.dates}
                  {p.meta && (
                    <>
                      <span aria-hidden="true"> · </span>
                      {p.meta}
                    </>
                  )}
                </p>
              </div>
              <ul className={styles.bullets}>
                {p.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {p.href && (
                <p className={styles.entryLink}>
                  <a href={`https://${p.href}`}>{p.href}</a>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Selected client work</h2>
        <ul className={styles.clientList}>
          {clientWork.map((c) => (
            <li key={c.name}>
              <span className={styles.clientName}>{c.name}</span>
              {c.role && (
                <span className={styles.clientRole}>
                  <span aria-hidden="true"> — </span>
                  {c.role}
                </span>
              )}
              <span className={styles.clientYear}>{c.year}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Skills</h2>
        <div className={styles.skills}>
          {skills.map((g) => (
            <div key={g.name} className={styles.skillGroup}>
              <h3 className={styles.skillGroupName}>{g.name}</h3>
              <div className={styles.skillTags}>
                {g.tags.map((t) => (
                  <span key={t} className={styles.skillTag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Awards</h2>
        <ul className={styles.awards}>
          {awards.map((a) => (
            <li key={a.source}>
              <span className={styles.awardTitle}>{a.title}</span>
              <span aria-hidden="true"> — </span>
              {a.href ? <a href={a.href}>{a.source}</a> : <span>{a.source}</span>}
              <span className={styles.awardDate}> ({a.date})</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
