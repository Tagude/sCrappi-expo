package com.talentotech.scrappi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talentotech.scrappi.model.User;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserName(String userName);
    Optional<User> findByDocument(Long document);
}
