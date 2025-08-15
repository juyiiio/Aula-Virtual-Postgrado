package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.dto.request.CourseRequest;
import com.unslg.aulavirtual.dto.response.CourseResponse;
import com.unslg.aulavirtual.entity.Course;
import com.unslg.aulavirtual.entity.User;
import com.unslg.aulavirtual.exception.BadRequestException;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.CourseRepository;
import com.unslg.aulavirtual.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return convertToResponse(course);
    }

    public List<CourseResponse> getCoursesByInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + instructorId));
        return courseRepository.findByInstructor(instructor).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesByStudent(Long studentId) {
        return courseRepository.findByEnrolledStudentsId(studentId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Course code is already in use");
        }

        Course course = new Course();
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());
        course.setAcademicPeriod(request.getAcademicPeriod());
        course.setGroupNumber(request.getGroupNumber());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());

        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + request.getInstructorId()));
            course.setInstructor(instructor);
        }

        Course savedCourse = courseRepository.save(course);
        return convertToResponse(savedCourse);
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (!course.getCode().equals(request.getCode()) &&
                courseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Course code is already in use");
        }

        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());
        course.setAcademicPeriod(request.getAcademicPeriod());
        course.setGroupNumber(request.getGroupNumber());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());

        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + request.getInstructorId()));
            course.setInstructor(instructor);
        }

        Course savedCourse = courseRepository.save(course);
        return convertToResponse(savedCourse);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        courseRepository.delete(course);
    }

    public CourseResponse enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (course.getEnrolledStudents().contains(student)) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        course.getEnrolledStudents().add(student);
        Course savedCourse = courseRepository.save(course);
        return convertToResponse(savedCourse);
    }

    public CourseResponse unenrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        course.getEnrolledStudents().remove(student);
        Course savedCourse = courseRepository.save(course);
        return convertToResponse(savedCourse);
    }

    public List<CourseResponse> searchCourses(String searchTerm) {
        return courseRepository.findBySearchTerm(searchTerm).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private CourseResponse convertToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setName(course.getName());
        response.setCode(course.getCode());
        response.setDescription(course.getDescription());
        response.setCredits(course.getCredits());
        response.setAcademicPeriod(course.getAcademicPeriod());
        response.setGroupNumber(course.getGroupNumber());
        response.setStartDate(course.getStartDate());
        response.setEndDate(course.getEndDate());
        response.setStatus(course.getStatus().name());
        response.setEnrolledStudents(course.getEnrolledStudents().size());
        response.setCreatedAt(course.getCreatedAt());

        if (course.getInstructor() != null) {
            CourseResponse.InstructorResponse instructorResponse = new CourseResponse.InstructorResponse();
            instructorResponse.setId(course.getInstructor().getId());
            instructorResponse.setFirstName(course.getInstructor().getFirstName());
            instructorResponse.setLastName(course.getInstructor().getLastName());
            instructorResponse.setEmail(course.getInstructor().getEmail());
            response.setInstructor(instructorResponse);
        }

        return response;
    }
}
