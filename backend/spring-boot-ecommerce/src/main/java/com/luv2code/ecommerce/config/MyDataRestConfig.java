package com.luv2code.ecommerce.config;

import com.luv2code.ecommerce.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    @Value("${allowed.origins}")
    private String[] theAllowedOrigins;
    private EntityManager entityManager;

    @Autowired
    public MyDataRestConfig(EntityManager theEntityManager)
    {
        entityManager = theEntityManager;

    }
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {


        // disable Http methods for product: PUT, POST, DELETE
        HttpMethod[] theUnsupportedAction = {HttpMethod.PUT, HttpMethod.POST,
                                            HttpMethod.DELETE, HttpMethod.PATCH};

        disableHttpMethods(Product.class, config, theUnsupportedAction);
        disableHttpMethods(ProductCategory.class, config, theUnsupportedAction);
        disableHttpMethods(Country.class, config, theUnsupportedAction);
        disableHttpMethods(State.class, config, theUnsupportedAction);
        disableHttpMethods(Order.class, config, theUnsupportedAction);


        // call the internal helper method
        exposeId(config);
        cors.addMapping(config.getBasePath() + "/**").allowedOrigins(theAllowedOrigins);

    }

    private static void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] theUnsupportedAction) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedAction)))
                .withCollectionExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedAction)));
    }

    private void exposeId(RepositoryRestConfiguration config) {
        //expose entity id
        //

        // - get a list of all entity classes from the entity manager
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        List<Class> entityClasses = new ArrayList<>();

        // - get the entity types for the entities;
        for(EntityType tempEntityType: entities)
        {
            entityClasses.add(tempEntityType.getJavaType());
        }
        // - expose entity ids for the entity/domain types
        Class[] domainTypes = entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }
}
