/**
 * Logger pour l'orchestrateur
 * Affiche des messages colorés et structurés
 */

import config from '../config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Codes ANSI pour les couleurs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Icônes
const icons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  step: '➡️',
  mobile: '📱',
  web: '🌐',
  api: '🔌',
  sync: '🔄',
  screenshot: '📸',
  time: '⏱️',
  check: '✓',
  cross: '✗',
  arrow: '→',
};

class Logger {
  private currentPhase: string = '';
  private stepCount: number = 0;
  private startTime: number = Date.now();

  /**
   * Affiche le header du flow
   */
  header(flowName: string): void {
    const line = '═'.repeat(60);
    console.log(`\n${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}  ORCHESTRATOR - ${flowName}${colors.reset}`);
    console.log(`${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.gray}  Démarré à: ${new Date().toLocaleTimeString()}${colors.reset}\n`);
    this.startTime = Date.now();
    this.stepCount = 0;
  }

  /**
   * Démarre une nouvelle phase
   */
  phase(name: string): void {
    this.currentPhase = name;
    console.log(`\n${colors.yellow}${colors.bright}═══ ${name.toUpperCase()} ═══${colors.reset}\n`);
  }

  /**
   * Log une étape
   */
  step(message: string, platform?: 'mobile' | 'web' | 'api'): void {
    this.stepCount++;
    const icon = platform === 'mobile' ? icons.mobile :
                 platform === 'web' ? icons.web :
                 platform === 'api' ? icons.api : icons.step;

    const prefix = `${colors.blue}[${this.stepCount.toString().padStart(2, '0')}]${colors.reset}`;
    console.log(`${prefix} ${icon}  ${message}`);
  }

  /**
   * Log un succès
   */
  success(message: string): void {
    console.log(`     ${colors.green}${icons.success} ${message}${colors.reset}`);
  }

  /**
   * Log une info
   */
  info(message: string): void {
    if (config.verbose) {
      console.log(`     ${colors.gray}${icons.info} ${message}${colors.reset}`);
    }
  }

  /**
   * Log un warning
   */
  warn(message: string): void {
    console.log(`     ${colors.yellow}${icons.warning} ${message}${colors.reset}`);
  }

  /**
   * Log une erreur
   */
  error(message: string, error?: Error): void {
    console.log(`     ${colors.red}${icons.error} ${message}${colors.reset}`);
    if (error && config.verbose) {
      console.log(`     ${colors.red}${error.stack}${colors.reset}`);
    }
  }

  /**
   * Log une synchronisation
   */
  sync(message: string): void {
    console.log(`     ${colors.magenta}${icons.sync} ${message}${colors.reset}`);
  }

  /**
   * Log une capture d'écran
   */
  screenshot(path: string): void {
    console.log(`     ${colors.cyan}${icons.screenshot} Screenshot: ${path}${colors.reset}`);
  }

  /**
   * Log une assertion
   */
  assert(condition: boolean, message: string): void {
    if (condition) {
      console.log(`     ${colors.green}${icons.check} ${message}${colors.reset}`);
    } else {
      console.log(`     ${colors.red}${icons.cross} ${message}${colors.reset}`);
    }
  }

  /**
   * Log les données partagées
   */
  data(key: string, value: any): void {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    console.log(`     ${colors.cyan}📦 ${key}: ${colors.white}${valueStr}${colors.reset}`);
  }

  /**
   * Affiche le footer avec le résumé
   */
  footer(success: boolean, stats?: { passed: number; failed: number; skipped: number }): void {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const line = '─'.repeat(60);

    console.log(`\n${colors.gray}${line}${colors.reset}`);

    if (success) {
      console.log(`${colors.green}${colors.bright}  ${icons.success} FLOW TERMINÉ AVEC SUCCÈS${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}  ${icons.error} FLOW ÉCHOUÉ${colors.reset}`);
    }

    console.log(`${colors.gray}  ${icons.time} Durée: ${duration}s | Étapes: ${this.stepCount}${colors.reset}`);

    if (stats) {
      console.log(`${colors.gray}  ${colors.green}✓ ${stats.passed} passés${colors.reset} | ${colors.red}✗ ${stats.failed} échoués${colors.reset} | ${colors.yellow}○ ${stats.skipped} ignorés${colors.reset}`);
    }

    console.log(`${colors.gray}${line}${colors.reset}\n`);
  }

  /**
   * Table de données
   */
  table(data: Record<string, any>): void {
    console.log(`     ${colors.gray}┌${'─'.repeat(40)}┐${colors.reset}`);
    for (const [key, value] of Object.entries(data)) {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      console.log(`     ${colors.gray}│${colors.reset} ${key.padEnd(18)} ${colors.gray}│${colors.reset} ${valueStr.substring(0, 18).padEnd(18)} ${colors.gray}│${colors.reset}`);
    }
    console.log(`     ${colors.gray}└${'─'.repeat(40)}┘${colors.reset}`);
  }
}

export const logger = new Logger();
export default logger;