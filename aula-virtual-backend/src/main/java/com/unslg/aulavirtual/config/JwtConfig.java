package com.unslg.aulavirtual.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {
    private String secret = "mySecretKey";
    private long expirationInMs = 86400000; // 24 hours
    private long refreshExpirationInMs = 604800000; // 7 days
}
