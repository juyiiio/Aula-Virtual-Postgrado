package com.unslg.aulavirtual.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true, nullable = false)
    private RoleName name;

    @Column(length = 100)
    private String description;

    public enum RoleName {
        ADMIN, INSTRUCTOR, STUDENT, COORDINATOR
    }

    public Role(RoleName name) {
        this.name = name;
    }
}
