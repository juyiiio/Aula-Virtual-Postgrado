import React, { createContext, useState, useEffect } from 'react';
import courseService from '../services/courseService';
import useAuth from '../hooks/useAuth';

const CourseContext = createContext();

const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let coursesData = [];
      
      if (user) {
        if (user.roles.some(role => role.name === 'STUDENT')) {
          coursesData = await courseService.getStudentCourses(user.id);
        } else if (user.roles.some(role => role.name === 'INSTRUCTOR')) {
          coursesData = await courseService.getInstructorCourses(user.id);
        } else {
          coursesData = await courseService.getCourses();
        }
      }
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCourses = () => {
    fetchCourses();
  };

  const addCourse = (course) => {
    setCourses(prev => [...prev, course]);
  };

  const updateCourse = (courseId, updatedCourse) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId ? { ...course, ...updatedCourse } : course
      )
    );
  };

  const removeCourse = (courseId) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const value = {
    courses,
    selectedCourse,
    loading,
    setSelectedCourse,
    fetchCourses,
    refreshCourses,
    addCourse,
    updateCourse,
    removeCourse
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export { CourseContext, CourseProvider };
