import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import Layout from './components/common/Layout/Layout';

// Pages
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

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <Navigate to="/dashboard" replace />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <Layout>
                        <Courses />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/courses/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <CourseDetails />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/assignments" element={
                    <ProtectedRoute>
                      <Layout>
                        <Assignments />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/assignments/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <AssignmentDetails />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/exams" element={
                    <ProtectedRoute>
                      <Layout>
                        <Exams />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/exams/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <ExamDetails />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/forums" element={
                    <ProtectedRoute>
                      <Layout>
                        <Forums />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/forums/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <ForumDetails />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Layout>
                        <CalendarPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/conferences" element={
                    <ProtectedRoute>
                      <Layout>
                        <VideoConference />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users" element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'COORDINATOR']}>
                      <Layout>
                        <Users />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <UserDetails />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/announcements" element={
                    <ProtectedRoute>
                      <Layout>
                        <Announcements />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <Layout>
                        <Resources />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
