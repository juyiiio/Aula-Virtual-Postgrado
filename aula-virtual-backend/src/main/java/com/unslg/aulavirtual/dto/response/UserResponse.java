package com.unslg.aulavirtual.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String userCode;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String maternalSurname;
    private String phone;
    private String profilePicture;
    private String status;
    private Set<RoleResponse> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    @Data
    public static class RoleResponse {
        private Long id;
        private String name;
        private String description;
    }
}
