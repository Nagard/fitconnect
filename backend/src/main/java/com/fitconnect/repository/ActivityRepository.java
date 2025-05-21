package com.fitconnect.repository;

import com.fitconnect.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findAllByOrderByTimestampDesc();
    List<Activity> findByUserOrderByTimestampDesc(String user);

}
