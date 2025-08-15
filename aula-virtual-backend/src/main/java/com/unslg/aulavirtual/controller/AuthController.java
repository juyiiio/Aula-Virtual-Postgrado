package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.request.LoginRequest;
import com.unslg.aulavirtual.dto.request.RegisterRequest;
import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.dto.response.JwtResponse;
import com.unslg.aulavirtual.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponse>> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        JwtResponse jwtResponse = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", jwtResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
}
