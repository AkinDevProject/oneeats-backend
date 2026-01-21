/**
 * Reporter - Génération de rapports de test cross-platform
 */

import * as fs from 'fs';
import * as path from 'path';
import config from '../config';
import logger from './logger';
import { DataStore } from './data-store';

export interface StepResult {
  stepNumber: number;
  name: string;
  platform: 'mobile' | 'web' | 'api' | 'orchestrator';
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
  data?: Record<string, any>;
}

export interface FlowResult {
  flowName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'passed' | 'failed';
  steps: StepResult[];
  dataStore: Record<string, any>;
  errors: string[];
  screenshots: string[];
}

export class Reporter {
  private flowName: string = '';
  private startTime: Date = new Date();
  private steps: StepResult[] = [];
  private currentStepNumber: number = 0;
  private currentStepStartTime: number = 0;
  private errors: string[] = [];
  private screenshots: string[] = [];
  private dataStore: DataStore;

  constructor(dataStore?: DataStore) {
    this.dataStore = dataStore || new DataStore();
  }

  /**
   * Démarre un nouveau flow
   */
  startFlow(flowName: string): void {
    this.flowName = flowName;
    this.startTime = new Date();
    this.steps = [];
    this.currentStepNumber = 0;
    this.errors = [];
    this.screenshots = [];

    logger.header(flowName);
  }

  /**
   * Démarre une nouvelle phase
   */
  startPhase(phaseName: string): void {
    logger.phase(phaseName);
  }

  /**
   * Démarre une étape
   */
  startStep(name: string, platform: 'mobile' | 'web' | 'api' | 'orchestrator' = 'orchestrator'): void {
    this.currentStepNumber++;
    this.currentStepStartTime = Date.now();
    logger.step(name, platform === 'orchestrator' ? undefined : platform);
  }

  /**
   * Termine une étape avec succès
   */
  passStep(name: string, platform: 'mobile' | 'web' | 'api' | 'orchestrator' = 'orchestrator', data?: Record<string, any>): void {
    const duration = Date.now() - this.currentStepStartTime;

    this.steps.push({
      stepNumber: this.currentStepNumber,
      name,
      platform,
      status: 'passed',
      duration,
      data,
    });

    logger.success(`${name} (${duration}ms)`);
  }

  /**
   * Termine une étape avec échec
   */
  failStep(name: string, platform: 'mobile' | 'web' | 'api' | 'orchestrator', error: Error, screenshotPath?: string): void {
    const duration = Date.now() - this.currentStepStartTime;

    this.steps.push({
      stepNumber: this.currentStepNumber,
      name,
      platform,
      status: 'failed',
      duration,
      error: error.message,
      screenshot: screenshotPath,
    });

    this.errors.push(`[${platform.toUpperCase()}] ${name}: ${error.message}`);

    if (screenshotPath) {
      this.screenshots.push(screenshotPath);
    }

    logger.error(`${name}: ${error.message}`, error);
  }

  /**
   * Marque une étape comme ignorée
   */
  skipStep(name: string, reason: string): void {
    this.steps.push({
      stepNumber: this.currentStepNumber,
      name,
      platform: 'orchestrator',
      status: 'skipped',
      duration: 0,
      error: reason,
    });

    logger.warn(`${name} ignoré: ${reason}`);
  }

  /**
   * Ajoute une capture d'écran
   */
  addScreenshot(screenshotPath: string): void {
    this.screenshots.push(screenshotPath);
    logger.screenshot(screenshotPath);
  }

  /**
   * Termine le flow et génère le rapport
   */
  endFlow(status: 'passed' | 'failed'): FlowResult {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const result: FlowResult = {
      flowName: this.flowName,
      startTime: this.startTime,
      endTime,
      duration,
      status,
      steps: this.steps,
      dataStore: this.dataStore.getAll(),
      errors: this.errors,
      screenshots: this.screenshots,
    };

    // Statistiques
    const stats = {
      passed: this.steps.filter(s => s.status === 'passed').length,
      failed: this.steps.filter(s => s.status === 'failed').length,
      skipped: this.steps.filter(s => s.status === 'skipped').length,
    };

    logger.footer(status === 'passed', stats);

    // Sauvegarder le rapport
    this.saveReport(result);

    return result;
  }

  /**
   * Sauvegarde le rapport sur disque
   */
  private saveReport(result: FlowResult): void {
    const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const flowSlug = this.flowName.toLowerCase().replace(/\s+/g, '-');

    // Créer le répertoire si nécessaire
    if (!fs.existsSync(config.reportsDir)) {
      fs.mkdirSync(config.reportsDir, { recursive: true });
    }

    // Rapport JSON
    const jsonPath = path.join(config.reportsDir, `${flowSlug}_${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    logger.info(`Rapport JSON: ${jsonPath}`);

    // Rapport Markdown
    const mdPath = path.join(config.reportsDir, `${flowSlug}_${timestamp}.md`);
    fs.writeFileSync(mdPath, this.generateMarkdownReport(result));
    logger.info(`Rapport Markdown: ${mdPath}`);
  }

  /**
   * Génère un rapport au format Markdown
   */
  private generateMarkdownReport(result: FlowResult): string {
    const statusEmoji = result.status === 'passed' ? '✅' : '❌';
    const durationSec = (result.duration / 1000).toFixed(2);

    let md = `# Rapport de Test Cross-Platform\n\n`;
    md += `## ${statusEmoji} ${result.flowName}\n\n`;
    md += `| Propriété | Valeur |\n`;
    md += `|-----------|--------|\n`;
    md += `| **Statut** | ${result.status.toUpperCase()} |\n`;
    md += `| **Durée** | ${durationSec}s |\n`;
    md += `| **Début** | ${result.startTime.toLocaleString()} |\n`;
    md += `| **Fin** | ${result.endTime.toLocaleString()} |\n`;
    md += `| **Étapes** | ${result.steps.length} |\n\n`;

    // Résumé
    const passed = result.steps.filter(s => s.status === 'passed').length;
    const failed = result.steps.filter(s => s.status === 'failed').length;
    const skipped = result.steps.filter(s => s.status === 'skipped').length;

    md += `## Résumé\n\n`;
    md += `- ✅ Passés: ${passed}\n`;
    md += `- ❌ Échoués: ${failed}\n`;
    md += `- ⏭️ Ignorés: ${skipped}\n\n`;

    // Étapes détaillées
    md += `## Étapes\n\n`;
    md += `| # | Étape | Plateforme | Statut | Durée |\n`;
    md += `|---|-------|------------|--------|-------|\n`;

    for (const step of result.steps) {
      const stepEmoji = step.status === 'passed' ? '✅' : step.status === 'failed' ? '❌' : '⏭️';
      const platformEmoji = step.platform === 'mobile' ? '📱' :
                           step.platform === 'web' ? '🌐' :
                           step.platform === 'api' ? '🔌' : '🔧';
      md += `| ${step.stepNumber} | ${step.name} | ${platformEmoji} ${step.platform} | ${stepEmoji} | ${step.duration}ms |\n`;
    }

    // Erreurs
    if (result.errors.length > 0) {
      md += `\n## Erreurs\n\n`;
      for (const error of result.errors) {
        md += `- ❌ ${error}\n`;
      }
    }

    // Données partagées
    if (Object.keys(result.dataStore).length > 0) {
      md += `\n## Données partagées\n\n`;
      md += `\`\`\`json\n${JSON.stringify(result.dataStore, null, 2)}\n\`\`\`\n`;
    }

    // Screenshots
    if (result.screenshots.length > 0) {
      md += `\n## Captures d'écran\n\n`;
      for (const screenshot of result.screenshots) {
        md += `![Screenshot](${screenshot})\n\n`;
      }
    }

    md += `\n---\n`;
    md += `*Généré par OneEats Orchestrator*\n`;

    return md;
  }

  /**
   * Assertion avec logging
   */
  assert(condition: boolean, message: string): void {
    logger.assert(condition, message);
    if (!condition) {
      throw new Error(`Assertion échouée: ${message}`);
    }
  }

  /**
   * Assertion d'égalité
   */
  assertEqual<T>(actual: T, expected: T, message: string): void {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    logger.assert(isEqual, `${message}: ${actual} === ${expected}`);
    if (!isEqual) {
      throw new Error(`Assertion échouée: ${message}. Attendu: ${expected}, Reçu: ${actual}`);
    }
  }
}

export default Reporter;