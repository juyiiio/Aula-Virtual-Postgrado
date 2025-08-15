package com.unslg.aulavirtual;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AulaVirtualApplication {
    public static void main(String[] args) {
        SpringApplication.run(AulaVirtualApplication.class, args);
    }
}
