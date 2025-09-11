package com.oneeats.user.domain.service;

import com.oneeats.user.domain.model.User;
import com.oneeats.shared.domain.vo.Email;

public interface IUserDomainService {
    void validateUserCreation(String firstName, String lastName, Email email);
    void validateUserUpdate(User user, String firstName, String lastName);
    boolean canDeleteUser(User user);
}