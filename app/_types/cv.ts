export type CvHeader = {
  name: string;
  role: string;
  contact: {
    email: string;
    portfolio: string;
    github: string;
    linkedin: string;
    phone: string;
  };
};

export type CvStat = {
  value: string;
  label: string;
};

export type CvExperience = {
  role: string;
  org?: string;
  dates: string;
  location?: string;
  bullets: readonly string[];
};

export type CvProject = {
  title: string;
  tagline: string;
  dates: string;
  meta?: string;
  bullets: readonly string[];
  href?: string;
};

export type CvClientLine = {
  name: string;
  year: string;
  role?: string;
};

export type CvSkillGroup = {
  name: string;
  tags: readonly string[];
};

export type CvAward = {
  title: string;
  source: string;
  date: string;
  href?: string;
};

export type CvContent = {
  header: CvHeader;
  about: string;
  stats: readonly CvStat[];
  experience: readonly CvExperience[];
  featuredProjects: readonly CvProject[];
  clientWork: readonly CvClientLine[];
  skills: readonly CvSkillGroup[];
  awards: readonly CvAward[];
};
