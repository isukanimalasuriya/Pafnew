package com.example.IT23234048.repository;

import com.example.IT23234048.model.Resource;
import com.example.IT23234048.model.ResourceStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeIgnoreCase(String type);

    List<Resource> findByLocationIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByTypeIgnoreCaseAndLocationIgnoreCase(String type, String location);

    List<Resource> findByTypeIgnoreCaseAndStatus(String type, ResourceStatus status);

    List<Resource> findByLocationIgnoreCaseAndStatus(String location, ResourceStatus status);

    List<Resource> findByTypeIgnoreCaseAndLocationIgnoreCaseAndStatus(
            String type,
            String location,
            ResourceStatus status
    );
}
