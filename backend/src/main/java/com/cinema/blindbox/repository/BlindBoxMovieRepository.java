package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.BlindBoxMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlindBoxMovieRepository extends JpaRepository<BlindBoxMovie, Long> {

    List<BlindBoxMovie> findByBlindBoxId(Long blindBoxId);

    void deleteByBlindBoxId(Long blindBoxId);
}
