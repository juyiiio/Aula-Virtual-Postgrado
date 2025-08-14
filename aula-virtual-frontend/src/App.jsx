import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Courses from './pages/Courses/Courses';
import CourseDetails from './pages/Courses/CourseDetails';
import Assignments from './pages/Assignments/Assignments';
import AssignmentDetails from './pages/Assignments/AssignmentDetails';
import Exams from './pages/Exams/Exams';
import ExamDetails from './pages/Exams/ExamDetails';
import Forums from './pages/Forums/Forums';
import ForumDetails from './pages/Forums/ForumDetails';
import CalendarPage from './pages/Calendar/CalendarPage';
import VideoConference from './pages/VideoConference/VideoConference';
import Users from './pages/Users/Users';
import UserDetails from './pages/Users/UserDetails';
import Profile from './pages/Profile/Profile';
import Announcements from './pages/Announcements/Announcements';
import Resources from './pages/Resources/Resources';
import NotFound from './pages/NotFound/NotFound';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CourseProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  
                  <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
                  <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
                  
                  <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
                  <Route path="/assignments/:id" element={<ProtectedRoute><AssignmentDetails /></ProtectedRoute>} />
                  
                  <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
                  <Route path="/exams/:id" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
                  
                  <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
                  <Route path="/forums/:id" element={<ProtectedRoute><ForumDetails /></ProtectedRoute>} />
                  
                  <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                  
                  <Route path="/videoconference" element={<ProtectedRoute><VideoConference /></ProtectedRoute>} />
                  
                  <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
                  
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  
                  <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
                  
                  <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </CourseProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
