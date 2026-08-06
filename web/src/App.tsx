import { motion } from 'motion/react'

function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <p className="text-sm font-medium tracking-wide text-sky-700 uppercase">
          Pacific Dataviz 2026
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          D3 + React visualization
        </h1>
        <p className="text-slate-600">
          Vite, TypeScript, Tailwind CSS, Motion, and D3 are ready.
        </p>
      </motion.div>
    </main>
  )
}

export default App
