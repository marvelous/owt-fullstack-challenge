package swiss.owt.fullstack.challenge;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Boat {

    @Id
    @GeneratedValue
    public Long id;

    @NotBlank(message = "Name is mandatory")
    public String name;

    @NotBlank(message = "Description is mandatory")
    public String description;

}
