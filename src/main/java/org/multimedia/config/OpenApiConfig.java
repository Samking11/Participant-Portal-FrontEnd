package org.multimedia.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI participantOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Participant Bank Management API (branch1-no-auth-no-logo)")
                        .description("""
                                REST API for Participant Bank Management and Authentication.
                                
                                Branch: `branch1-no-auth-no-logo`
                                - No accessToken is required to test or call any endpoint.
                                - Logo upload is not required for participant bank CRUD.
                                - Login endpoint authenticates against static credentials, logs into Keycloak, and synchronizes the user to PostgreSQL.
                                """)
                        .version("1.0.0-branch1")
                        .contact(new Contact()
                                .name("EthSwitch Multimedia Team")
                                .url("https://epg.ethswitch.et"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://epg.ethswitch.et"))
                );
    }
}
