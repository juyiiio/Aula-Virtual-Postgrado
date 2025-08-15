package com.unslg.aulavirtual.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("noreply@aulavirtual.com");

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending email to: {}", to, e);
        }
    }

    public void sendWelcomeEmail(String email, String firstName) {
        String subject = "Bienvenido al Aula Virtual";
        String text = String.format("Hola %s,\n\nBienvenido al Aula Virtual UNSLG.\n\nSaludos cordiales,\nEquipo Aula Virtual", firstName);
        sendSimpleMessage(email, subject, text);
    }

    public void sendAssignmentNotification(String email, String assignmentTitle, String courseName) {
        String subject = "Nueva tarea asignada - " + courseName;
        String text = String.format("Se ha asignado una nueva tarea: %s en el curso %s.", assignmentTitle, courseName);
        sendSimpleMessage(email, subject, text);
    }
}
