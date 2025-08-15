package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.dto.request.RegisterRequest;
import com.unslg.aulavirtual.dto.response.UserResponse;
import com.unslg.aulavirtual.entity.Role;
import com.unslg.aulavirtual.entity.User;
import com.unslg.aulavirtual.exception.BadRequestException;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.RoleRepository;
import com.unslg.aulavirtual.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponse(user);
    }

    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        if (userRepository.existsByUserCode(request.getUserCode())) {
            throw new BadRequestException("User code is already in use");
        }

        User user = new User();
        user.setUserCode(request.getUserCode());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setMaternalSurname(request.getMaternalSurname());
        user.setPhone(request.getPhone());

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role studentRole = roleRepository.findByName(Role.RoleName.STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(studentRole);
        } else {
            request.getRoles().forEach(role -> {
                Role.RoleName roleName = Role.RoleName.valueOf(role);
                Role userRole = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);
            });
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setMaternalSurname(request.getMaternalSurname());
        user.setPhone(request.getPhone());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public void updateLastLogin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserResponse changeUserStatus(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(status);
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    public List<UserResponse> searchUsers(String searchTerm) {
        return userRepository.findBySearchTerm(searchTerm).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUserCode(user.getUserCode());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setMaternalSurname(user.getMaternalSurname());
        response.setPhone(user.getPhone());
        response.setProfilePicture(user.getProfilePicture());
        response.setStatus(user.getStatus().name());
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLogin(user.getLastLogin());

        Set<UserResponse.RoleResponse> roleResponses = user.getRoles().stream()
                .map(role -> {
                    UserResponse.RoleResponse roleResponse = new UserResponse.RoleResponse();
                    roleResponse.setId(role.getId());
                    roleResponse.setName(role.getName().name());
                    roleResponse.setDescription(role.getDescription());
                    return roleResponse;
                })
                .collect(Collectors.toSet());
        response.setRoles(roleResponses);

        return response;
    }
}
