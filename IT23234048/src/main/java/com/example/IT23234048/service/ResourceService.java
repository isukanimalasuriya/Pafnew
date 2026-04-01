package com.example.IT23234048.service;

import com.example.IT23234048.dto.ResourceDTO;
import com.example.IT23234048.model.Resource;
import com.example.IT23234048.model.ResourceStatus;
import com.example.IT23234048.repository.ResourceRepository;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public Resource create(ResourceDTO dto) {
        validateMandatoryFields(dto);
        Resource resource = mapDtoToResource(new Resource(), dto);
        return repository.save(resource);
    }

    public List<Resource> getAll() {
        return repository.findAll();
    }

    public Resource getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    public Resource update(String id, ResourceDTO dto) {
        Resource existing = getById(id);
        validateMandatoryFields(dto);
        Resource updated = mapDtoToResource(existing, dto);
        return repository.save(updated);
    }

    public void delete(String id) {
        Resource existing = getById(id);
        repository.delete(existing);
    }

    public List<Resource> filter(String type, String location, Integer capacity, String statusText) {
        ResourceStatus status = parseStatus(statusText);
        List<Resource> baseResults = filterByTypeLocationStatus(type, location, status);

        if (capacity == null) {
            return baseResults;
        }
        if (capacity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity cannot be negative");
        }

        return baseResults.stream()
                .filter(resource -> resource.getCapacity() != null && resource.getCapacity() >= capacity)
                .toList();
    }

    private List<Resource> filterByTypeLocationStatus(String type, String location, ResourceStatus status) {
        boolean hasType = hasText(type);
        boolean hasLocation = hasText(location);
        boolean hasStatus = status != null;

        if (!hasType && !hasLocation && !hasStatus) {
            return repository.findAll();
        }
        if (hasType && hasLocation && hasStatus) {
            return repository.findByTypeIgnoreCaseAndLocationIgnoreCaseAndStatus(type, location, status);
        }
        if (hasType && hasLocation) {
            return repository.findByTypeIgnoreCaseAndLocationIgnoreCase(type, location);
        }
        if (hasType && hasStatus) {
            return repository.findByTypeIgnoreCaseAndStatus(type, status);
        }
        if (hasLocation && hasStatus) {
            return repository.findByLocationIgnoreCaseAndStatus(location, status);
        }
        if (hasType) {
            return repository.findByTypeIgnoreCase(type);
        }
        if (hasLocation) {
            return repository.findByLocationIgnoreCase(location);
        }
        return repository.findByStatus(status);
    }

    private Resource mapDtoToResource(Resource resource, ResourceDTO dto) {
        resource.setName(dto.getName().trim());
        resource.setType(dto.getType().trim());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation().trim());
        resource.setStatus(parseStatus(dto.getStatus()));
        return resource;
    }

    private void validateMandatoryFields(ResourceDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        if (Stream.of(dto.getName(), dto.getType(), dto.getLocation(), dto.getStatus()).anyMatch(value -> !hasText(value))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "name, type, location and status are required"
            );
        }

        if (dto.getCapacity() == null || dto.getCapacity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "capacity must be zero or greater");
        }

        parseStatus(dto.getStatus());
    }

    private ResourceStatus parseStatus(String value) {
        if (!hasText(value)) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        try {
            return ResourceStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Allowed values: ACTIVE, OUT_OF_SERVICE"
            );
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
