package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.dto.request.AssignmentRequest;
import com.unslg.aulavirtual.entity.Assignment;
import com.unslg.aulavirtual.entity.Course;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.AssignmentRepository;
import com.unslg.aulavirtual.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
    }

    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    public List<Assignment> getAssignmentsByStudent(Long studentId) {
        return assignmentRepository.findByStudentId(studentId);
    }

    public Assignment createAssignment(AssignmentRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setInstructions(request.getInstructions());
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxPoints(request.getMaxPoints());
        assignment.setMaxFileSize(request.getMaxFileSize());
        assignment.setAllowedExtensions(request.getAllowedExtensions());
        assignment.setCourse(course);

        if (request.getSubmissionType() != null) {
            assignment.setSubmissionType(Assignment.SubmissionType.valueOf(request.getSubmissionType()));
        }

        return assignmentRepository.save(assignment);
    }

    public Assignment updateAssignment(Long id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setInstructions(request.getInstructions());
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxPoints(request.getMaxPoints());
        assignment.setMaxFileSize(request.getMaxFileSize());
        assignment.setAllowedExtensions(request.getAllowedExtensions());

        if (request.getSubmissionType() != null) {
            assignment.setSubmissionType(Assignment.SubmissionType.valueOf(request.getSubmissionType()));
        }

        return assignmentRepository.save(assignment);
    }

    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        assignmentRepository.delete(assignment);
    }

    public List<Assignment> searchAssignments(String searchTerm) {
        return assignmentRepository.findBySearchTerm(searchTerm);
    }
}
