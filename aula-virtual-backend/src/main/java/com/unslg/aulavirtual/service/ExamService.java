package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.dto.request.ExamRequest;
import com.unslg.aulavirtual.entity.Course;
import com.unslg.aulavirtual.entity.Exam;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.CourseRepository;
import com.unslg.aulavirtual.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
    }

    public List<Exam> getExamsByCourse(Long courseId) {
        return examRepository.findByCourseId(courseId);
    }

    public List<Exam> getExamsByStudent(Long studentId) {
        return examRepository.findByStudentId(studentId);
    }

    public Exam createExam(ExamRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setMaxPoints(request.getMaxPoints());
        exam.setPassingGrade(request.getPassingGrade());
        exam.setInstructions(request.getInstructions());
        exam.setCourse(course);

        if (request.getExamType() != null) {
            exam.setExamType(Exam.ExamType.valueOf(request.getExamType()));
        }

        return examRepository.save(exam);
    }

    public Exam updateExam(Long id, ExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setMaxPoints(request.getMaxPoints());
        exam.setPassingGrade(request.getPassingGrade());
        exam.setInstructions(request.getInstructions());

        if (request.getExamType() != null) {
            exam.setExamType(Exam.ExamType.valueOf(request.getExamType()));
        }

        return examRepository.save(exam);
    }

    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        examRepository.delete(exam);
    }
}
