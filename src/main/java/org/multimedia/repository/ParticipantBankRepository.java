package org.multimedia.repository;

import org.multimedia.model.ParticipantBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantBankRepository extends JpaRepository<ParticipantBank, Long> {

    Optional<ParticipantBank> findByBic(String bic);

    boolean existsByBic(String bic);

    boolean existsByName(String name);

    @Query("SELECT p FROM ParticipantBank p WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.bic) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.shortName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ParticipantBank> searchByQuery(@Param("query") String query);
}
