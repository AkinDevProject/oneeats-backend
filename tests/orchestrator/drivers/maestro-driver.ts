/**
 * Maestro Driver - Interface avec Maestro pour les tests mobile
 *
 * Permet d'exécuter des flows Maestro et de récupérer les résultats.
 * Maestro est un outil de test mobile qui utilise des fichiers YAML.
 */

import { exec, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import config from '../config';
import { logger, wait, withTimeout } from '../utils';

const execAsync = promisify(exec);

export interface MaestroResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export interface MaestroFlowOptions {
  variables?: Record<string, string>;
  timeout?: number;
  continueOnError?: boolean;
}

export class MaestroDriver {
  private maestroPath: string;
  private flowsDir: string;
  private screenshotsDir: string;

  constructor() {
    // Chemin vers Maestro (peut varier selon l'installation)
    this.maestroPath = process.env.MAESTRO_PATH || 'maestro';
    this.flowsDir = config.maestroFlowsDir;
    this.screenshotsDir = config.screenshotsDir;

    // Créer le répertoire de screenshots si nécessaire
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Vérifie que Maestro est installé et accessible
   */
  async checkInstallation(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.maestroPath} --version`);
      logger.info(`Maestro version: ${stdout.trim()}`);
      return true;
    } catch (error) {
      logger.error('Maestro non installé ou non accessible');
      return false;
    }
  }

  /**
   * Vérifie qu'un émulateur Android est connecté
   */
  async checkEmulator(): Promise<boolean> {
    try {
      const adbPath = process.env.ADB_PATH ||
        path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');

      const { stdout } = await execAsync(`"${adbPath}" devices`);
      const lines = stdout.split('\n').filter(line => line.includes('emulator'));

      if (lines.length === 0) {
        logger.warn('Aucun émulateur Android connecté');
        return false;
      }

      logger.info(`Émulateur détecté: ${lines[0].trim()}`);
      return true;
    } catch (error) {
      logger.error('Impossible de vérifier l\'émulateur ADB');
      return false;
    }
  }

  /**
   * Exécute un flow Maestro depuis un fichier YAML
   */
  async runFlow(flowFile: string, options: MaestroFlowOptions = {}): Promise<MaestroResult> {
    const { timeout = config.timeouts.maestroCommand, variables = {} } = options;

    // Résoudre le chemin du flow
    let flowPath = flowFile;
    if (!path.isAbsolute(flowFile)) {
      flowPath = path.join(this.flowsDir, flowFile);
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(flowPath)) {
      throw new Error(`Flow Maestro non trouvé: ${flowPath}`);
    }

    logger.step(`Exécution flow Maestro: ${path.basename(flowPath)}`, 'mobile');

    // Construire la commande
    let command = `${this.maestroPath} test "${flowPath}"`;

    // Ajouter les variables d'environnement
    for (const [key, value] of Object.entries(variables)) {
      command += ` -e ${key}="${value}"`;
    }

    const startTime = Date.now();

    try {
      const result = await withTimeout(
        execAsync(command, {
          timeout,
          env: { ...process.env, ...variables },
        }),
        timeout,
        `Flow Maestro timeout après ${timeout}ms`
      );

      const duration = Date.now() - startTime;

      logger.success(`Flow terminé (${duration}ms)`);

      return {
        success: true,
        output: result.stdout,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error(`Flow échoué: ${error.message}`);

      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration,
      };
    }
  }

  /**
   * Génère et exécute un flow Maestro dynamique
   */
  async runDynamicFlow(
    steps: MaestroStep[],
    options: MaestroFlowOptions = {}
  ): Promise<MaestroResult> {
    // Générer le contenu YAML
    const yaml = this.generateYaml(steps);

    // Créer un fichier temporaire
    const tempFile = path.join(this.flowsDir, `_temp_${Date.now()}.yaml`);

    try {
      fs.writeFileSync(tempFile, yaml);
      logger.info(`Flow temporaire créé: ${tempFile}`);

      // Exécuter le flow
      const result = await this.runFlow(tempFile, options);

      return result;
    } finally {
      // Nettoyer le fichier temporaire
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  /**
   * Prend une capture d'écran
   */
  async screenshot(name?: string): Promise<string> {
    const filename = name || `screenshot_${Date.now()}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    try {
      await execAsync(`${this.maestroPath} screenshot "${filepath}"`);
      logger.screenshot(filepath);
      return filepath;
    } catch (error) {
      logger.error(`Screenshot échoué: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Lance l'application
   */
  async launchApp(appId?: string): Promise<MaestroResult> {
    const id = appId || 'com.oneeats.mobile';
    return this.runDynamicFlow([{ action: 'launchApp', appId: id }]);
  }

  /**
   * Ferme l'application
   */
  async closeApp(appId?: string): Promise<MaestroResult> {
    const id = appId || 'com.oneeats.mobile';
    return this.runDynamicFlow([{ action: 'stopApp', appId: id }]);
  }

  /**
   * Tape sur un élément
   */
  async tap(target: string): Promise<MaestroResult> {
    return this.runDynamicFlow([{ action: 'tapOn', target }]);
  }

  /**
   * Saisit du texte
   */
  async type(text: string, target?: string): Promise<MaestroResult> {
    const steps: MaestroStep[] = [];
    if (target) {
      steps.push({ action: 'tapOn', target });
    }
    steps.push({ action: 'inputText', text });
    return this.runDynamicFlow(steps);
  }

  /**
   * Vérifie qu'un élément est visible
   */
  async assertVisible(target: string): Promise<MaestroResult> {
    return this.runDynamicFlow([{ action: 'assertVisible', target }]);
  }

  /**
   * Fait défiler l'écran
   */
  async scroll(direction: 'up' | 'down' = 'down'): Promise<MaestroResult> {
    const action = direction === 'up' ? 'scrollUntilVisible' : 'scroll';
    return this.runDynamicFlow([{ action }]);
  }

  /**
   * Attend un certain temps
   */
  async waitMs(ms: number): Promise<void> {
    await wait(ms);
  }

  /**
   * Génère le contenu YAML pour un flow
   */
  private generateYaml(steps: MaestroStep[]): string {
    let yaml = 'appId: com.oneeats.mobile\n---\n';

    for (const step of steps) {
      yaml += this.stepToYaml(step);
    }

    return yaml;
  }

  /**
   * Convertit une étape en YAML
   */
  private stepToYaml(step: MaestroStep): string {
    switch (step.action) {
      case 'launchApp':
        return `- launchApp:\n    appId: "${step.appId || 'com.oneeats.mobile'}"\n`;

      case 'stopApp':
        return `- stopApp:\n    appId: "${step.appId || 'com.oneeats.mobile'}"\n`;

      case 'tapOn':
        return `- tapOn: "${step.target}"\n`;

      case 'inputText':
        return `- inputText: "${step.text}"\n`;

      case 'assertVisible':
        return `- assertVisible: "${step.target}"\n`;

      case 'assertNotVisible':
        return `- assertNotVisible: "${step.target}"\n`;

      case 'scroll':
        return `- scroll\n`;

      case 'scrollUntilVisible':
        return `- scrollUntilVisible:\n    element: "${step.target}"\n`;

      case 'wait':
        return `- wait: ${step.duration || 1000}\n`;

      case 'back':
        return `- pressKey: back\n`;

      case 'clearText':
        return `- clearText\n`;

      default:
        return '';
    }
  }
}

/**
 * Types d'étapes Maestro
 */
export interface MaestroStep {
  action:
    | 'launchApp'
    | 'stopApp'
    | 'tapOn'
    | 'inputText'
    | 'assertVisible'
    | 'assertNotVisible'
    | 'scroll'
    | 'scrollUntilVisible'
    | 'wait'
    | 'back'
    | 'clearText';
  target?: string;
  text?: string;
  appId?: string;
  duration?: number;
}

export default MaestroDriver;