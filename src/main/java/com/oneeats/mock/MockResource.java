package com.oneeats.mock;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Consumes;
import java.util.HashMap;
import java.util.Map;

@Path("/mock")
@Produces(MediaType.APPLICATION_JSON)
public class MockResource {
    @GET
    public Response getMock() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", 1);
        data.put("nom", "Restaurant Test");
        data.put("adresse", "123 rue de la Mock");
        return Response.ok(data).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response postMock(Map<String, Object> input) {
        // Retourne simplement les données reçues (echo)
        return Response.ok(input).build();
    }
}
