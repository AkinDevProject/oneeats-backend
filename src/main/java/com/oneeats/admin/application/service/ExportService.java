package com.oneeats.admin.application.service;

import com.opencsv.CSVWriter;
import com.oneeats.order.domain.model.OrderStatus;
import com.oneeats.order.infrastructure.entity.OrderEntity;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service pour l'export de données en CSV et Excel
 */
@ApplicationScoped
public class ExportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ==================== RESTAURANTS ====================

    @Transactional
    public byte[] exportRestaurantsCsv(RestaurantStatus statusFilter) throws IOException {
        List<RestaurantEntity> restaurants = getRestaurants(statusFilter);

        StringWriter stringWriter = new StringWriter();
        try (CSVWriter writer = new CSVWriter(stringWriter, ';', '"', '"', "\n")) {
            // Header
            writer.writeNext(new String[]{
                "ID", "Nom", "Email", "Téléphone", "Adresse",
                "Type Cuisine", "Statut", "Ouvert", "Date Création"
            });

            // Data
            for (RestaurantEntity r : restaurants) {
                writer.writeNext(new String[]{
                    r.getId().toString(),
                    r.getName(),
                    r.getEmail(),
                    r.getPhone(),
                    r.getAddress(),
                    r.getCuisineType(),
                    r.getStatus().name(),
                    r.isOpen() ? "Oui" : "Non",
                    formatDate(r.getCreatedAt())
                });
            }
        }

        return stringWriter.toString().getBytes("UTF-8");
    }

    @Transactional
    public byte[] exportRestaurantsExcel(RestaurantStatus statusFilter) throws IOException {
        List<RestaurantEntity> restaurants = getRestaurants(statusFilter);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Restaurants");
            CellStyle headerStyle = createHeaderStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Nom", "Email", "Téléphone", "Adresse",
                "Type Cuisine", "Statut", "Ouvert", "Date Création"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (RestaurantEntity r : restaurants) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId().toString());
                row.createCell(1).setCellValue(r.getName());
                row.createCell(2).setCellValue(r.getEmail());
                row.createCell(3).setCellValue(r.getPhone());
                row.createCell(4).setCellValue(r.getAddress());
                row.createCell(5).setCellValue(r.getCuisineType());
                row.createCell(6).setCellValue(r.getStatus().name());
                row.createCell(7).setCellValue(r.isOpen() ? "Oui" : "Non");
                row.createCell(8).setCellValue(formatDate(r.getCreatedAt()));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<RestaurantEntity> getRestaurants(RestaurantStatus statusFilter) {
        if (statusFilter != null) {
            return RestaurantEntity.find("status", statusFilter).list();
        }
        return RestaurantEntity.findAll().list();
    }

    // ==================== USERS ====================

    @Transactional
    public byte[] exportUsersCsv(UserStatus statusFilter) throws IOException {
        List<UserEntity> users = getUsers(statusFilter);

        StringWriter stringWriter = new StringWriter();
        try (CSVWriter writer = new CSVWriter(stringWriter, ';', '"', '"', "\n")) {
            // Header
            writer.writeNext(new String[]{
                "ID", "Prénom", "Nom", "Email", "Téléphone",
                "Statut", "Date Inscription", "Dernière MAJ"
            });

            // Data
            for (UserEntity u : users) {
                writer.writeNext(new String[]{
                    u.getId().toString(),
                    u.getFirstName(),
                    u.getLastName(),
                    u.getEmail(),
                    u.getPhone() != null ? u.getPhone() : "",
                    u.getStatus().name(),
                    formatDate(u.getCreatedAt()),
                    formatDate(u.getUpdatedAt())
                });
            }
        }

        return stringWriter.toString().getBytes("UTF-8");
    }

    @Transactional
    public byte[] exportUsersExcel(UserStatus statusFilter) throws IOException {
        List<UserEntity> users = getUsers(statusFilter);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Utilisateurs");
            CellStyle headerStyle = createHeaderStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Prénom", "Nom", "Email", "Téléphone",
                "Statut", "Date Inscription", "Dernière MAJ"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (UserEntity u : users) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(u.getId().toString());
                row.createCell(1).setCellValue(u.getFirstName());
                row.createCell(2).setCellValue(u.getLastName());
                row.createCell(3).setCellValue(u.getEmail());
                row.createCell(4).setCellValue(u.getPhone() != null ? u.getPhone() : "");
                row.createCell(5).setCellValue(u.getStatus().name());
                row.createCell(6).setCellValue(formatDate(u.getCreatedAt()));
                row.createCell(7).setCellValue(formatDate(u.getUpdatedAt()));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<UserEntity> getUsers(UserStatus statusFilter) {
        if (statusFilter != null) {
            return UserEntity.find("status", statusFilter).list();
        }
        return UserEntity.findAll().list();
    }

    // ==================== ORDERS ====================

    @Transactional
    public byte[] exportOrdersCsv(OrderStatus statusFilter, LocalDateTime fromDate, LocalDateTime toDate) throws IOException {
        List<OrderEntity> orders = getOrders(statusFilter, fromDate, toDate);

        StringWriter stringWriter = new StringWriter();
        try (CSVWriter writer = new CSVWriter(stringWriter, ';', '"', '"', "\n")) {
            // Header
            writer.writeNext(new String[]{
                "ID", "Numéro", "Client ID", "Restaurant ID", "Statut",
                "Montant Total", "Instructions", "Date Création", "Date MAJ"
            });

            // Data
            for (OrderEntity o : orders) {
                writer.writeNext(new String[]{
                    o.getId().toString(),
                    o.getOrderNumber(),
                    o.getUserId().toString(),
                    o.getRestaurantId().toString(),
                    o.getStatus().name(),
                    String.format("%.2f", o.getTotalAmount()),
                    o.getSpecialInstructions() != null ? o.getSpecialInstructions() : "",
                    formatDate(o.getCreatedAt()),
                    formatDate(o.getUpdatedAt())
                });
            }
        }

        return stringWriter.toString().getBytes("UTF-8");
    }

    @Transactional
    public byte[] exportOrdersExcel(OrderStatus statusFilter, LocalDateTime fromDate, LocalDateTime toDate) throws IOException {
        List<OrderEntity> orders = getOrders(statusFilter, fromDate, toDate);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Commandes");
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Numéro", "Client ID", "Restaurant ID", "Statut",
                "Montant Total", "Instructions", "Date Création", "Date MAJ"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (OrderEntity o : orders) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(o.getId().toString());
                row.createCell(1).setCellValue(o.getOrderNumber());
                row.createCell(2).setCellValue(o.getUserId().toString());
                row.createCell(3).setCellValue(o.getRestaurantId().toString());
                row.createCell(4).setCellValue(o.getStatus().name());

                Cell amountCell = row.createCell(5);
                amountCell.setCellValue(o.getTotalAmount().doubleValue());
                amountCell.setCellStyle(currencyStyle);

                row.createCell(6).setCellValue(o.getSpecialInstructions() != null ? o.getSpecialInstructions() : "");
                row.createCell(7).setCellValue(formatDate(o.getCreatedAt()));
                row.createCell(8).setCellValue(formatDate(o.getUpdatedAt()));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<OrderEntity> getOrders(OrderStatus statusFilter, LocalDateTime fromDate, LocalDateTime toDate) {
        StringBuilder query = new StringBuilder("1=1");

        if (statusFilter != null) {
            query.append(" and status = '").append(statusFilter.name()).append("'");
        }
        if (fromDate != null) {
            query.append(" and createdAt >= '").append(fromDate).append("'");
        }
        if (toDate != null) {
            query.append(" and createdAt <= '").append(toDate).append("'");
        }

        return OrderEntity.find(query.toString()).list();
    }

    // ==================== HELPERS ====================

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00 €"));
        return style;
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) return "";
        return date.format(DATE_FORMAT);
    }
}
