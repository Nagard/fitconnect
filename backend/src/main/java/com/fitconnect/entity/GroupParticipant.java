package com.fitconnect.entity;

import jakarta.persistence.*;

@Entity
public class GroupParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Group group;

    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role = Role.MEMBER;

    public enum Role {
        ADMIN,
        MEMBER
    }

    public GroupParticipant() {}

    public GroupParticipant(Group group, User user, Role role) {
        this.group = group;
        this.user = user;
        this.role = role;
    }

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
