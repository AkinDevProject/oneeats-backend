package com.oneeats.admin.application.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.oneeats.analytics.application.dto.PlatformStatsDTO;
import com.oneeats.analytics.application.dto.TopRestaurantDTO;
import com.oneeats.analytics.application.service.AnalyticsService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service pour générer des rapports PDF avec statistiques
 */
@ApplicationScoped
public class PdfReportService {

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(139, 92, 246); // Violet
    private static final DeviceRgb SECONDARY_COLOR = new DeviceRgb(99, 102, 241); // Indigo
    private static final DeviceRgb SUCCESS_COLOR = new DeviceRgb(34, 197, 94); // Green
    private static final DeviceRgb WARNING_COLOR = new DeviceRgb(234, 179, 8); // Yellow
    private static final DeviceRgb DANGER_COLOR = new DeviceRgb(239, 68, 68); // Red
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(249, 250, 251);

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Inject
    AnalyticsService analyticsService;

    /**
     * Génère un rapport PDF complet avec les statistiques de la plateforme
     */
    public byte[] generatePlatformReport(LocalDate fromDate, LocalDate toDate) throws IOException {
        PlatformStatsDTO stats = analyticsService.getPlatformStats();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(40, 40, 40, 40);

        try {
            // En-tête
            addHeader(document, fromDate, toDate);

            // Résumé exécutif
            addExecutiveSummary(document, stats);

            // Statistiques clés
            addKeyMetrics(document, stats);

            // Répartition des commandes
            addOrderDistribution(document, stats);

            // Top Restaurants
            addTopRestaurants(document, stats);

            // Tendances
            addTrends(document, stats);

            // Pied de page
            addFooter(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addHeader(Document document, LocalDate fromDate, LocalDate toDate) {
        // Logo/Titre
        Paragraph title = new Paragraph("OneEats")
            .setFontSize(28)
            .setBold()
            .setFontColor(PRIMARY_COLOR)
            .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("Rapport Statistiques Plateforme")
            .setFontSize(16)
            .setFontColor(ColorConstants.DARK_GRAY)
            .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitle);

        // Période
        String periodText = "Période: ";
        if (fromDate != null && toDate != null) {
            periodText += fromDate.format(DATE_FORMAT) + " - " + toDate.format(DATE_FORMAT);
        } else {
            periodText += "Toutes les données";
        }

        Paragraph period = new Paragraph(periodText)
            .setFontSize(11)
            .setFontColor(ColorConstants.GRAY)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20);
        document.add(period);

        // Ligne de séparation
        addSeparator(document);
    }

    private void addExecutiveSummary(Document document, PlatformStatsDTO stats) {
        Paragraph sectionTitle = createSectionTitle("Résumé Exécutif");
        document.add(sectionTitle);

        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
            .useAllAvailableWidth()
            .setMarginBottom(20);

        // Ligne 1: Métriques principales
        addMetricCell(summaryTable, "Chiffre d'Affaires Total", formatCurrency(stats.getTotalRevenue()), SUCCESS_COLOR);
        addMetricCell(summaryTable, "Commandes Totales", formatNumber(stats.getTotalOrders()), PRIMARY_COLOR);
        addMetricCell(summaryTable, "Utilisateurs", formatNumber(stats.getTotalUsers()), SECONDARY_COLOR);
        addMetricCell(summaryTable, "Restaurants Actifs", formatNumber(stats.getActiveRestaurants()), WARNING_COLOR);

        document.add(summaryTable);
    }

    private void addKeyMetrics(Document document, PlatformStatsDTO stats) {
        Paragraph sectionTitle = createSectionTitle("Indicateurs Clés de Performance");
        document.add(sectionTitle);

        Table metricsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
            .useAllAvailableWidth()
            .setMarginBottom(20);

        // Panier moyen
        addInfoCell(metricsTable, "Panier Moyen", formatCurrency(stats.getAverageOrderValue()));

        // Revenus aujourd'hui
        addInfoCell(metricsTable, "Revenus Aujourd'hui", formatCurrency(stats.getTodayRevenue()));

        // Commandes aujourd'hui
        addInfoCell(metricsTable, "Commandes Aujourd'hui", formatNumber(stats.getTodayOrders()));

        // Revenus semaine
        addInfoCell(metricsTable, "Revenus (7 jours)", formatCurrency(stats.getWeekRevenue()));

        // Commandes semaine
        addInfoCell(metricsTable, "Commandes (7 jours)", formatNumber(stats.getWeekOrders()));

        // Restaurants en attente
        addInfoCell(metricsTable, "Restaurants en Attente", formatNumber(stats.getPendingRestaurants()));

        document.add(metricsTable);
    }

    private void addOrderDistribution(Document document, PlatformStatsDTO stats) {
        Paragraph sectionTitle = createSectionTitle("Répartition des Commandes par Statut");
        document.add(sectionTitle);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 1, 3}))
            .useAllAvailableWidth()
            .setMarginBottom(20);

        // En-tête
        table.addHeaderCell(createHeaderCell("Statut"));
        table.addHeaderCell(createHeaderCell("Nombre"));
        table.addHeaderCell(createHeaderCell("Pourcentage"));

        long total = safeValue(stats.getTotalOrders());
        if (total == 0) total = 1; // Éviter division par zéro

        addOrderStatusRow(table, "En attente", stats.getPendingOrders(), total, WARNING_COLOR);
        addOrderStatusRow(table, "Confirmées", stats.getConfirmedOrders(), total, SECONDARY_COLOR);
        addOrderStatusRow(table, "En préparation", stats.getPreparingOrders(), total, PRIMARY_COLOR);
        addOrderStatusRow(table, "Prêtes", stats.getReadyOrders(), total, SUCCESS_COLOR);
        addOrderStatusRow(table, "Complétées", stats.getCompletedOrders(), total, SUCCESS_COLOR);
        addOrderStatusRow(table, "Annulées", stats.getCancelledOrders(), total, DANGER_COLOR);

        document.add(table);
    }

    private void addTopRestaurants(Document document, PlatformStatsDTO stats) {
        if (stats.getTopRestaurants() == null || stats.getTopRestaurants().isEmpty()) {
            return;
        }

        Paragraph sectionTitle = createSectionTitle("Top 5 Restaurants");
        document.add(sectionTitle);

        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 2}))
            .useAllAvailableWidth()
            .setMarginBottom(20);

        // En-tête
        table.addHeaderCell(createHeaderCell("Restaurant"));
        table.addHeaderCell(createHeaderCell("Type Cuisine"));
        table.addHeaderCell(createHeaderCell("Commandes"));
        table.addHeaderCell(createHeaderCell("Revenus"));

        for (TopRestaurantDTO restaurant : stats.getTopRestaurants()) {
            table.addCell(createCell(restaurant.name()));
            table.addCell(createCell(restaurant.cuisineType()));
            table.addCell(createCell(formatNumber(restaurant.totalOrders())));
            table.addCell(createCell(formatCurrency(restaurant.totalRevenue())));
        }

        document.add(table);
    }

    private void addTrends(Document document, PlatformStatsDTO stats) {
        Paragraph sectionTitle = createSectionTitle("Tendances");
        document.add(sectionTitle);

        Table trendsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
            .useAllAvailableWidth()
            .setMarginBottom(20);

        // Croissance revenus
        addTrendCell(trendsTable, "Croissance Revenus", stats.getRevenueGrowth());

        // Croissance commandes
        addTrendCell(trendsTable, "Croissance Commandes", stats.getOrderGrowth());

        // Croissance utilisateurs
        addTrendCell(trendsTable, "Croissance Utilisateurs", stats.getUserGrowth());

        document.add(trendsTable);
    }

    private void addFooter(Document document) {
        addSeparator(document);

        Paragraph footer = new Paragraph("Rapport généré le " + LocalDateTime.now().format(DATETIME_FORMAT))
            .setFontSize(9)
            .setFontColor(ColorConstants.GRAY)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(10);
        document.add(footer);

        Paragraph disclaimer = new Paragraph("Ce rapport est confidentiel et destiné uniquement aux administrateurs OneEats.")
            .setFontSize(8)
            .setFontColor(ColorConstants.GRAY)
            .setTextAlignment(TextAlignment.CENTER)
            .setItalic();
        document.add(disclaimer);
    }

    // ==================== HELPERS ====================

    private Paragraph createSectionTitle(String text) {
        return new Paragraph(text)
            .setFontSize(14)
            .setBold()
            .setFontColor(PRIMARY_COLOR)
            .setMarginTop(15)
            .setMarginBottom(10);
    }

    private void addSeparator(Document document) {
        Table separator = new Table(1).useAllAvailableWidth();
        Cell cell = new Cell()
            .setBackgroundColor(LIGHT_GRAY)
            .setHeight(2)
            .setBorder(Border.NO_BORDER);
        separator.addCell(cell);
        separator.setMarginTop(10);
        separator.setMarginBottom(10);
        document.add(separator);
    }

    private void addMetricCell(Table table, String label, String value, DeviceRgb color) {
        Cell cell = new Cell()
            .setBackgroundColor(LIGHT_GRAY)
            .setPadding(15)
            .setTextAlignment(TextAlignment.CENTER)
            .setBorder(Border.NO_BORDER);

        Paragraph valueP = new Paragraph(value)
            .setFontSize(20)
            .setBold()
            .setFontColor(color);
        cell.add(valueP);

        Paragraph labelP = new Paragraph(label)
            .setFontSize(10)
            .setFontColor(ColorConstants.GRAY);
        cell.add(labelP);

        table.addCell(cell);
    }

    private void addInfoCell(Table table, String label, String value) {
        Cell cell = new Cell()
            .setPadding(10)
            .setBorder(Border.NO_BORDER);

        Paragraph labelP = new Paragraph(label)
            .setFontSize(9)
            .setFontColor(ColorConstants.GRAY);
        cell.add(labelP);

        Paragraph valueP = new Paragraph(value)
            .setFontSize(14)
            .setBold()
            .setFontColor(ColorConstants.BLACK);
        cell.add(valueP);

        table.addCell(cell);
    }

    private void addTrendCell(Table table, String label, Double growth) {
        Cell cell = new Cell()
            .setBackgroundColor(LIGHT_GRAY)
            .setPadding(15)
            .setTextAlignment(TextAlignment.CENTER)
            .setBorder(Border.NO_BORDER);

        String arrow = growth != null && growth >= 0 ? "↑" : "↓";
        DeviceRgb color = growth != null && growth >= 0 ? SUCCESS_COLOR : DANGER_COLOR;
        String valueStr = growth != null ? String.format("%s %.1f%%", arrow, Math.abs(growth)) : "N/A";

        Paragraph valueP = new Paragraph(valueStr)
            .setFontSize(16)
            .setBold()
            .setFontColor(color);
        cell.add(valueP);

        Paragraph labelP = new Paragraph(label)
            .setFontSize(10)
            .setFontColor(ColorConstants.GRAY);
        cell.add(labelP);

        table.addCell(cell);
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
            .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(PRIMARY_COLOR)
            .setPadding(8)
            .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createCell(String text) {
        return new Cell()
            .add(new Paragraph(text != null ? text : ""))
            .setPadding(8)
            .setTextAlignment(TextAlignment.CENTER);
    }

    private void addOrderStatusRow(Table table, String status, Long count, long total, DeviceRgb color) {
        long safeCount = safeValue(count);
        double percentage = (safeCount * 100.0) / total;

        table.addCell(new Cell()
            .add(new Paragraph(status).setFontColor(color))
            .setPadding(8));

        table.addCell(new Cell()
            .add(new Paragraph(formatNumber(safeCount)))
            .setPadding(8)
            .setTextAlignment(TextAlignment.CENTER));

        // Barre de progression simple
        String bar = "█".repeat((int) Math.max(1, percentage / 5)) + " " + String.format("%.1f%%", percentage);
        table.addCell(new Cell()
            .add(new Paragraph(bar).setFontColor(color).setFontSize(10))
            .setPadding(8));
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0,00 €";
        return String.format("%,.2f €", amount.doubleValue()).replace(",", " ").replace(".", ",");
    }

    private String formatNumber(Long number) {
        if (number == null) return "0";
        return String.format("%,d", number).replace(",", " ");
    }

    private long safeValue(Long value) {
        return value != null ? value : 0L;
    }
}
