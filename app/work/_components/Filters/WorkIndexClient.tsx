'use client';

import { useState } from 'react';
import { Filters } from './Filters';
import { IndexRow } from '../IndexRow/IndexRow';
import type { WorkProject } from '../../../_types/work';
import type { WorkFilterValue } from '../../../_lib/work-projects';
import styles from './_Filters.module.scss';

type Props = {
  projects: readonly WorkProject[];
  filters: readonly { value: WorkFilterValue; label: string }[];
};

export function WorkIndexClient({ projects, filters }: Props) {
  const [active, setActive] = useState<WorkFilterValue>('all');
  const visible =
    active === 'all' ? projects : projects.filter((p) => p.categories.includes(active));

  return (
    <>
      <Filters filters={filters} active={active} onChange={setActive} count={visible.length} />
      <ol className={styles.index} role="list">
        {visible.map((project) => (
          <IndexRow key={project.slug} project={project} />
        ))}
      </ol>
    </>
  );
}
