import { cvData } from './data/cv-data'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'

function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Hero personal={cvData.personal} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <About text={cvData.about} />
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
        <Skills categories={cvData.skills} />
        <Projects items={cvData.projects} />
        <Contact info={cvData.contact} />
      </main>
      <footer className="py-8 text-center text-sm text-text-muted no-print">
        <p>
          &copy; {new Date().getFullYear()} {cvData.personal.name}. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
