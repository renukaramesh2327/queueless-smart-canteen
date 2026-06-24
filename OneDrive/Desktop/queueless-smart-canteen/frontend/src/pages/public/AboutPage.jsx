import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="card p-8">
          <div className="text-center mb-8">
            <span className="text-5xl">🍛</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-3">About CampusBite</h1>
            <p className="text-gray-500 mt-2">Skip the Queue. Order Smart. Eat on Time.</p>
          </div>
          <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">
            <p>CampusBite is a smart canteen ordering system built to solve a real problem faced by thousands of college students every day — wasting precious lunch break time standing in long billing queues at the campus canteen.</p>
            <p>With CampusBite, students can browse the canteen menu on their phone, add items to their cart, pay online (or choose to pay at the counter), and receive a unique QR code. They can track their food preparation in real time and collect it from a dedicated pickup counter — no billing queue, no confusion.</p>
            <h2 className="text-lg font-bold text-gray-900">Technology Stack</h2>
            <p>Built with React, Vite, Tailwind CSS on the frontend and Python FastAPI, SQLAlchemy on the backend with SQLite for local development and PostgreSQL-ready for production.</p>
            <h2 className="text-lg font-bold text-gray-900">Demo Project</h2>
            <p>This is a college hackathon demonstration project. Payment processing is simulated and no real money transactions take place.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
