package com.oneeats.domain.admin.adapter.web;

import com.oneeats.domain.admin.api.cqrs.command.CreateAdminCommand;
import com.oneeats.domain.admin.api.cqrs.command.UpdateAdminCommand;
import com.oneeats.domain.admin.api.model.AdminDto;
import com.oneeats.domain.admin.internal.application.CreateAdminUseCase;
import com.oneeats.domain.admin.internal.application.UpdateAdminUseCase;
import com.oneeats.domain.admin.internal.application.GetAdminUseCase;
import com.oneeats.domain.admin.internal.application.GetAllAdminsUseCase;
import com.oneeats.domain.admin.internal.application.DeleteAdminUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/admins")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminResource {
    @Inject
    CreateAdminUseCase createAdminUseCase;
    @Inject
    UpdateAdminUseCase updateAdminUseCase;
    @Inject
    GetAdminUseCase getAdminUseCase;
    @Inject
    GetAllAdminsUseCase getAllAdminsUseCase;
    @Inject
    DeleteAdminUseCase deleteAdminUseCase;

    @POST
    public Response createAdmin(CreateAdminCommand command) {
        UUID id = createAdminUseCase.handle(command);
        return Response.status(Response.Status.CREATED).entity(id).build();
    }

    @PUT
    public Response updateAdmin(UpdateAdminCommand command) {
        boolean updated = updateAdminUseCase.handle(command);
        if (updated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getAdmin(@PathParam("id") UUID id) {
        Optional<AdminDto> dto = getAdminUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<AdminDto> getAllAdmins() {
        return getAllAdminsUseCase.handle();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteAdmin(@PathParam("id") UUID id) {
        boolean deleted = deleteAdminUseCase.handle(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
