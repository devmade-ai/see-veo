export interface CVData {
  personal: PersonalInfo
  about: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillCategory[]
  projects: ProjectItem[]
  contact: ContactInfo
}

export interface PersonalInfo {
  name: string
  title: string
  tagline: string
  location: string
  avatarInitials: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  period: string
  location?: string
  description: string
  highlights: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  period: string
  description: string
}

export interface SkillCategory {
  id: string
  category: string
  skills: string[]
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  tech: string[]
  link?: string
}

export interface ContactInfo {
  email: string
  linkedin: string
  github: string
  website?: string
}

export const cvData: CVData = {
  personal: {
    name: 'Jaco Theron',
    title: 'Solutions / Software / Sales Engineer & Analyst',
    tagline:
      'Bridging business needs and technical solutions across pre-sales, consulting, and development',
    location: 'City of Cape Town, Western Cape, South Africa',
    avatarInitials: 'JT',
  },
  about: `public class About {
    public static ResponseEntity<String> mysteryCheck(Person who) {
        if (!who.getComprehend()) {
            return ResponseEntity.status(HttpStatus.LOCKED).body("Thanks");
        } else {
            return ResponseEntity.status(HttpStatus.OK).body("Noted");
        }
    }
}`,
  experience: [
    {
      id: 'exp-iamapp-presales',
      company: 'I Am App (Pty) Ltd',
      role: 'Pre-Sales Software Engineer',
      period: 'Aug 2022 - Dec 2023',
      location: 'Cape Town, Western Cape, South Africa',
      description:
        'Provided technical expertise and support to sales teams during the pre-sales phase, translating business challenges into platform solutions for C-level executives.',
      highlights: [
        'Conducted live product demonstrations showcasing features, functionality, and value proposition to potential customers',
        'Designed customized software solutions by analysing customer requirements and recommending appropriate product configurations',
        'Developed and delivered proof of concept projects to demonstrate feasibility and value in customer environments',
        'Delivered technical presentations to both technical and non-technical audiences',
      ],
    },
    {
      id: 'exp-iamapp-consultant',
      company: 'I Am App (Pty) Ltd',
      role: 'Technical Consultant',
      period: 'Jun 2020 - Jul 2022',
      location: 'Cape Town, Western Cape, South Africa',
      description:
        'Part of a global team at Deutsche Bank developing a large-scale smart contract and deal capturing system handling complex deals across countries and legal frameworks.',
      highlights: [
        'Devised a solution to manage an increasingly complex set of rules for user access and editing permissions',
        'Resolved pre-existing issues, streamlined code into reusable components, and carried out refactoring',
        'Designed application structure, user interfaces, and workflows using BPMN process modelling',
        'Built integrations with external systems and databases for seamless data exchange',
        'Implemented business rules and expressions to control and automate decision-making processes',
      ],
    },
    {
      id: 'exp-santam',
      company: 'Santam Insurance',
      role: 'Analyst Developer',
      period: 'Oct 2016 - Apr 2019',
      location: 'Cape Town, Western Cape, South Africa',
      description:
        'Progressed from reporting and requirements gathering to full-stack development, eventually becoming lead developer on a standalone Spring Boot REST API for the financial system.',
      highlights: [
        'Designed data transfer objects, underlying databases and tables, and debugged existing code',
        'Conducted extensive integration testing using SoapUI',
        'Led development of a standalone Spring Boot REST API for the financial system — a first-of-its-kind project for the organisation',
        'Became the primary knowledge holder in the team, supporting senior developers across the codebase',
      ],
    },
    {
      id: 'exp-pbt',
      company: 'PBT Group',
      role: 'Master Data Management Consultant',
      period: 'Jan 2014 - Oct 2016',
      description:
        'Focused on data collection, analysis, quality assurance, and business intelligence across multiple client engagements.',
      highlights: [
        'Gathered and acquired data from various internal and external sources to support analysis and decision-making',
        'Applied statistical methods and data visualisation techniques to explore and interpret data patterns and trends',
        'Established and monitored key performance indicators (KPIs) to assess business performance',
        'Implemented data quality assurance measures and conducted data audits',
        'Identified opportunities to automate data-related processes and optimise workflows',
      ],
    },
  ],
  education: [
    {
      id: 'edu-stellenbosch',
      institution: 'Stellenbosch University',
      degree: 'Bachelor of Commerce (B.Comm), Management Sciences and Quantitative Methods',
      period: '2011 - 2013',
      description: '',
    },
    {
      id: 'edu-fti',
      institution: 'Faculty Training Institute (FTI)',
      degree: 'Diploma in Business Analysis for IT',
      period: '2015',
      description: '',
    },
    {
      id: 'edu-bytes',
      institution: 'Bytes People Solutions',
      degree: 'Certificate, Advanced Java',
      period: '2017',
      description: '',
    },
    {
      id: 'edu-torqueit',
      institution: 'TorqueIT',
      degree: 'Java Certificate, Java Development Fundamentals',
      period: '2014',
      description: '',
    },
    {
      id: 'edu-ibm',
      institution: 'IBM',
      degree: 'IBM Infosphere Certificate, Master Data Management',
      period: '2014',
      description: '',
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
      ],
    },
    {
      id: 'skill-data',
      category: 'Data & Integration',
      skills: [
        'SQL',
        'Data Modelling',
        'QlikView',
        'BPMN',
        'SoapUI',
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
      id: 'proj-see-veo',
      name: 'see-veo',
      description:
        'This site. A hand-coded CV and portfolio built from scratch — proof that the skills listed here are the real deal.',
      tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'PWA'],
      link: 'https://github.com/devmade-ai/see-veo',
    },
    {
      id: 'proj-canvagrid',
      name: 'CanvaGrid',
      description:
        'Create visual designs — social posts, ads, presentations, and stories. Build grid-based layouts with images, text, and presets, then style and download.',
      tech: [],
      link: 'https://devmade-ai.github.io/canva-grid/',
    },
    {
      id: 'proj-synctone',
      name: 'SyncTone',
      description:
        'Anonymous messaging where you tag the tone of your messages. No accounts, no phone numbers — just conversations.',
      tech: [],
      link: 'https://synctone.vercel.app',
    },
    {
      id: 'proj-repo-tor',
      name: 'Repo-Tor',
      description:
        'Git analytics reporting system. Extract and visualise commit history from any repository with interactive dashboards for progress, contributors, and code quality.',
      tech: [],
      link: 'https://devmade-ai.github.io/repo-tor/',
    },
  ],
  contact: {
    email: 'jacotheron87@gmail.com',
    linkedin: 'https://www.linkedin.com/in/jacotheron87',
    github: 'https://github.com/devmade-ai',
  },
}
