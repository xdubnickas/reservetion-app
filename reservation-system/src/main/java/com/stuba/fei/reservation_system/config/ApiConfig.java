package com.stuba.fei.reservation_system.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiConfig {
    
    @Value("${api.geodb.key:}")
    private String geoDbApiKey;
    
    @Value("${api.geodb.host:wft-geo-db.p.rapidapi.com}")
    private String geoDbApiHost;
    
    public String getGeoDbApiKey() {
        return geoDbApiKey;
    }
    
    public String getGeoDbApiHost() {
        return geoDbApiHost;
    }
}
