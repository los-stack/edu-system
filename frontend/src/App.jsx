import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import CoursePage from './pages/CoursePage';
import MyGrades from './pages/MyGrades';
import AdminDashboard from './pages/AdminDashboard';
import TakeQuiz from './pages/TakeQuiz';
import ProtectedRoute from './components/ProtectedRoute'; 
import ThemeToggle from './components/ThemeToggle'; 

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
        
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              </svg>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                EPlatform
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
               <ThemeToggle />
            </div>

          </div>
        </nav>

        <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
            <Route path="/my-grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
}

export default App;