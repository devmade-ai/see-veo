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
  company: string
  role: string
  period: string
  location: string
  description: string
  highlights: string[]
}

export interface EducationItem {
  institution: string
  degree: string
  period: string
  description: string
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface ProjectItem {
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
    name: 'John Doe',
    title: 'Senior Software Engineer',
    tagline: 'Building scalable web applications with modern technologies',
    location: 'San Francisco, CA',
    avatarInitials: 'JD',
  },
  about:
    'Passionate software engineer with 8+ years of experience designing and building high-performance web applications. Skilled in full-stack development with a focus on React, TypeScript, and cloud-native architectures. Committed to writing clean, maintainable code and mentoring junior developers.',
  experience: [
    {
      company: 'TechCorp Inc.',
      role: 'Senior Software Engineer',
      period: 'Jan 2022 - Present',
      location: 'San Francisco, CA',
      description:
        'Lead frontend architect for the company\'s flagship SaaS platform.',
      highlights: [
        'Architected a micro-frontend system serving 2M+ monthly active users',
        'Reduced bundle size by 40% through code splitting and lazy loading',
        'Mentored a team of 5 junior engineers, establishing code review practices',
        'Implemented CI/CD pipelines that reduced deployment time from 45min to 8min',
      ],
    },
    {
      company: 'WebSolutions Ltd.',
      role: 'Software Engineer',
      period: 'Mar 2019 - Dec 2021',
      location: 'Austin, TX',
      description: 'Full-stack developer on an e-commerce platform.',
      highlights: [
        'Built a real-time inventory management system using WebSockets',
        'Designed RESTful APIs serving 10K+ requests per minute',
        'Migrated legacy jQuery codebase to React, improving performance by 60%',
      ],
    },
    {
      company: 'StartupXYZ',
      role: 'Junior Developer',
      period: 'Jun 2017 - Feb 2019',
      location: 'Remote',
      description: 'Early engineering hire at a seed-stage startup.',
      highlights: [
        'Developed the initial MVP that secured $2M in Series A funding',
        'Implemented responsive designs achieving 98+ Lighthouse accessibility scores',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      period: '2013 - 2017',
      description:
        'Graduated with honors. Focus on distributed systems and HCI.',
    },
  ],
  skills: [
    {
      category: 'Frontend',
      skills: [
        'React',
        'TypeScript',
        'Next.js',
        'Tailwind CSS',
        'HTML/CSS',
        'Redux',
      ],
    },
    {
      category: 'Backend',
      skills: [
        'Node.js',
        'Python',
        'PostgreSQL',
        'Redis',
        'GraphQL',
        'REST APIs',
      ],
    },
    {
      category: 'DevOps & Tools',
      skills: ['Docker', 'AWS', 'CI/CD', 'Git', 'Terraform', 'Kubernetes'],
    },
    {
      category: 'Practices',
      skills: [
        'Agile/Scrum',
        'TDD',
        'Code Review',
        'System Design',
        'Mentoring',
      ],
    },
  ],
  projects: [
    {
      name: 'OpenDash',
      description:
        'An open-source analytics dashboard framework built with React and D3.js. Supports custom widgets, real-time data streams, and exportable reports.',
      tech: ['React', 'D3.js', 'TypeScript', 'WebSockets'],
      link: 'https://github.com/johndoe/opendash',
    },
    {
      name: 'DevBlog Engine',
      description:
        'A markdown-powered static blog generator with built-in SEO optimization, syntax highlighting, and RSS feed generation.',
      tech: ['Next.js', 'MDX', 'Tailwind CSS'],
      link: 'https://github.com/johndoe/devblog',
    },
    {
      name: 'TaskFlow CLI',
      description:
        'A command-line task management tool with Git-like syntax for developers who prefer terminal workflows.',
      tech: ['Rust', 'SQLite', 'TOML'],
      link: 'https://github.com/johndoe/taskflow',
    },
  ],
  contact: {
    email: 'john.doe@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev',
  },
}
