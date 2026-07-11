// Requirement: Single source of truth for all CV content + the game's section config.
// Approach: Content mirrors the "The Applicant" handoff design verbatim; section
//   metadata (flag label + coin value) drives both the pixel-runner navigation and
//   the score HUD. Edit this one file to update the resume.
// Alternatives considered:
//   - Split content and game config into two files: Rejected — they are read together
//     by the orchestrator and stay in sync more easily side by side.

export type SectionId =
  | 'profile'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'education'
  | 'contact'

/** One navigable "level" — a flag on the ground and a coin worth `coinValue`. */
export interface SectionMeta {
  id: SectionId
  /** Short label printed under the flag on the game strip. */
  flagLabel: string
  /** Points awarded the first time the visitor reaches this section. */
  coinValue: number
}

export interface Stat {
  label: string
  value: string
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  description: string
  highlights: string[]
}

export interface SkillCategory {
  id: string
  category: string
  skills: string[]
}

export interface ProjectItem {
  id: string
  name: string
  /** Short "React · TypeScript · PWA" style stack line. */
  stack: string
  url: string
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  period: string
}

export interface SocialLink {
  url: string
  label: string
}

export interface PersonalInfo {
  name: string
  title: string
  location: string
  quote: string
  email: string
  linkedin: SocialLink
  github: SocialLink
}

export interface CVData {
  personal: PersonalInfo
  /** One-paragraph positioning statement shown on the profile "level". */
  profileIntro: string
  stats: Stat[]
  experience: ExperienceItem[]
  skills: SkillCategory[]
  projects: ProjectItem[]
  education: EducationItem[]
}

// Order here defines walk order (← / →) and left-to-right flag placement.
export const sections: SectionMeta[] = [
  { id: 'profile', flagLabel: 'Profile', coinValue: 50 },
  { id: 'experience', flagLabel: 'Work', coinValue: 150 },
  { id: 'skills', flagLabel: 'Skills', coinValue: 100 },
  { id: 'projects', flagLabel: 'Projects', coinValue: 150 },
  { id: 'education', flagLabel: 'Study', coinValue: 100 },
  { id: 'contact', flagLabel: 'Contact', coinValue: 100 },
]

export const cvData: CVData = {
  personal: {
    name: 'Jaco Theron',
    title: 'Solutions / Software / Sales Engineer & Analyst',
    location: 'Cape Town, South Africa',
    quote:
      'Jack of all trades, master of none, often better than a master of one.',
    email: 'hello@devmade.ai',
    linkedin: {
      url: 'https://www.linkedin.com/in/jacotheron87',
      label: 'linkedin.com/in/jacotheron87',
    },
    github: {
      url: 'https://github.com/devmade-ai',
      label: 'github.com/devmade-ai',
    },
  },
  profileIntro:
    'A builder-first engineer who moves fluidly between the technical and the commercial — scoping and selling solutions, then designing and shipping them. Nine years across insurance, banking, startups and independent consulting, translating messy business problems into working software.',
  stats: [
    { label: 'Experience', value: '9+ yrs' },
    { label: 'Shipped', value: '4 apps' },
    { label: 'Domains', value: '37+' },
    { label: 'Languages', value: 'EN · NL' },
  ],
  experience: [
    {
      id: 'exp-independent',
      role: 'Solutions Consultant & Engineer',
      company: 'Independent',
      period: 'Jan 2024 — Present',
      description:
        'Delivered a range of independent engagements spanning audio analytics, web applications, crypto infrastructure, BPO and contact-centre operations, and machine learning, combining hands-on engineering with sales and advisory work.',
      highlights: [
        'Scoped, sold, and co-built audio analytics',
        'Developed web applications across multiple stacks (JavaScript, TypeScript, Node.js, PHP)',
        'Integrated Fireblocks and adjacent crypto infrastructure for secure digital-asset workflows',
        'Led sales, consulting and contract negotiation from scoping to signed agreement',
      ],
    },
    {
      id: 'exp-iamapp-presales',
      role: 'Pre-Sales Software Engineer',
      company: 'I Am App (Pty) Ltd',
      period: 'Aug 2022 — Dec 2023',
      description:
        'Provided technical expertise to sales teams during the pre-sales phase, translating business challenges into platform solutions for C-level executives.',
      highlights: [
        'Ran live product demonstrations showing features and value to prospects',
        'Designed customised software solutions from customer requirements',
        'Delivered proof-of-concept projects to demonstrate feasibility',
      ],
    },
    {
      id: 'exp-iamapp-consultant',
      role: 'Technical Consultant',
      company: 'I Am App (Pty) Ltd',
      period: 'Jun 2020 — Jul 2022',
      description:
        'Part of a global team at Deutsche Bank developing a large-scale smart-contract and deal-capture system handling complex deals across countries and legal frameworks.',
      highlights: [
        'Devised a solution to manage complex user access and editing permissions',
        'Refactored code into reusable components',
        'Built integrations with external systems and databases',
      ],
    },
    {
      id: 'exp-santam',
      role: 'Analyst Developer',
      company: 'Santam Insurance',
      period: 'Oct 2016 — Apr 2019',
      description:
        'Progressed from reporting and requirements gathering to full-stack development, becoming lead developer on a standalone Spring Boot REST API for the financial system.',
      highlights: [
        'Led a standalone Spring Boot REST API — a first-of-its-kind project for the org',
        'Ran extensive integration testing with SoapUI',
        'Became the primary knowledge holder in the team',
      ],
    },
  ],
  skills: [
    {
      id: 'skill-core',
      category: 'Core',
      skills: [
        'Business Analysis',
        'Pre-Sales Consulting',
        'Systems Analysis',
        'Solution Design',
        'Requirements Engineering',
        'Technical Documentation',
        'Product Demonstrations',
        'Process Optimisation',
        'Sales',
        'Consulting',
        'Contract Negotiation',
      ],
    },
    {
      id: 'skill-dev',
      category: 'Development',
      skills: [
        'Java',
        'Spring Boot',
        'REST APIs',
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Next.js',
        'PHP',
        'Tailwind CSS',
        'Git / CI/CD',
      ],
    },
    {
      id: 'skill-ai',
      category: 'AI & Automation',
      skills: ['AI (Advanced Usage)', 'Deep Research', 'Automation'],
    },
    {
      id: 'skill-data',
      category: 'Data & Integration',
      skills: [
        'SQL',
        'PL/SQL',
        'Data Modelling',
        'Neo4j',
        'Graph Databases',
        'Supabase',
        'Firebase',
        'Postman',
        'Vercel / Serverless',
        'Master Data Management',
      ],
    },
    {
      id: 'skill-lang',
      category: 'Languages',
      skills: ['English (Native)', 'Dutch (Native)'],
    },
  ],
  projects: [
    {
      id: 'proj-graphiki',
      name: 'Graphiki',
      stack: 'React · TypeScript · PWA',
      url: 'https://graphiki.vercel.app/',
      description:
        'A visual knowledge workspace for building and exploring networks of connected ideas — runs entirely in the browser, offline-first.',
    },
    {
      id: 'proj-canvagrid',
      name: 'CanvaGrid',
      stack: 'React · Tailwind · pdf-lib',
      url: 'https://canva-grid.vercel.app/',
      description:
        'A browser-based visual design tool for social posts, presentations and print — with ready-made layouts and export in 28 formats.',
    },
    {
      id: 'proj-synctone',
      name: 'SyncTone',
      stack: 'React Native · Expo · Supabase',
      url: 'https://synctone.vercel.app',
      description:
        'An anonymous messaging app where you tag the tone of each message — happy, sarcastic, sincere — revealed when the recipient opens the chat.',
    },
    {
      id: 'proj-fuelhunt',
      name: 'FuelHunt',
      stack: 'React Native · Mapbox · PostGIS',
      url: 'https://few-lap.vercel.app',
      description:
        'A fuel-station finder for South Africa that locates the cheapest fuel nearby, filters by type, and gives directions via a full-screen map.',
    },
  ],
  education: [
    {
      id: 'edu-stellenbosch',
      degree: 'B.Comm, Management Sciences & Quantitative Methods',
      institution: 'Stellenbosch University',
      period: '2011 — 2013',
    },
    {
      id: 'edu-fti',
      degree: 'Diploma in Business Analysis for IT',
      institution: 'Faculty Training Institute (FTI)',
      period: '2015',
    },
    {
      id: 'edu-bytes',
      degree: 'Certificate, Advanced Java',
      institution: 'Bytes People Solutions',
      period: '2017',
    },
    {
      id: 'edu-ibm',
      degree: 'IBM InfoSphere Certificate, Master Data Management',
      institution: 'IBM',
      period: '2014',
    },
  ],
}
