package swiss.owt.fullstack.challenge;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoatRepository extends CrudRepository<Boat, Long> {
}
