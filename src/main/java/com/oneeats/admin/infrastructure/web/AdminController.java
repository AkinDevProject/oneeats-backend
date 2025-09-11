package com.oneeats.admin.infrastructure.web;

import com.oneeats.admin.application.command.CreateAdminCommand;
import com.oneeats.admin.application.command.CreateAdminCommandHandler;
import com.oneeats.admin.application.dto.AdminDTO;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

@Path("/api/admins")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminController {

    @Inject
    CreateAdminCommandHandler createAdminCommandHandler;

    @POST
    public Response createAdmin(@Valid CreateAdminCommand command) {
        AdminDTO admin = createAdminCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(admin).build();
    }

    @GET
    @Path("/{id}")
    public Response getAdminById(@PathParam("id") UUID id) {
        // TODO: Implement GetAdminQuery and Handler
        return Response.ok().build();
    }
}