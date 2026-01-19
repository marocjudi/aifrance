import { chromium, Browser, Page } from 'playwright'

interface NavigationTask {
  targetSite: string
  credentials?: {
    username: string
    password: string
  }
  actions: NavigationAction[]
}

interface NavigationAction {
  type: 'navigate' | 'fill' | 'click' | 'screenshot' | 'extract' | 'wait'
  selector?: string
  value?: string
  url?: string
  timeout?: number
}

interface NavigationResult {
  success: boolean
  screenshots: string[]
  extractedData?: any
  logs: string[]
  error?: string
}

export class PlaywrightAgent {
  private browser: Browser | null = null
  private page: Page | null = null
  private screenshots: string[] = []
  private logs: string[] = []

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      
      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
      })

      this.page = await context.newPage()
      this.log('Navigateur initialisé avec succès')
    } catch (error) {
      this.log(`Erreur initialisation: ${error}`)
      throw error
    }
  }

  async executeTask(task: NavigationTask): Promise<NavigationResult> {
    if (!this.page) {
      await this.initialize()
    }

    try {
      this.log(`Début de la tâche sur ${task.targetSite}`)

      for (const action of task.actions) {
        await this.executeAction(action)
      }

      return {
        success: true,
        screenshots: this.screenshots,
        logs: this.logs,
      }
    } catch (error) {
      this.log(`Erreur: ${error}`)
      
      if (this.page) {
        const errorScreenshot = await this.page.screenshot({ fullPage: true })
        this.screenshots.push(errorScreenshot.toString('base64'))
      }

      return {
        success: false,
        screenshots: this.screenshots,
        logs: this.logs,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    } finally {
      await this.cleanup()
    }
  }

  private async executeAction(action: NavigationAction): Promise<void> {
    if (!this.page) throw new Error('Page non initialisée')

    switch (action.type) {
      case 'navigate':
        if (!action.url) throw new Error('URL manquante')
        this.log(`Navigation vers ${action.url}`)
        await this.page.goto(action.url, { waitUntil: 'networkidle' })
        break

      case 'fill':
        if (!action.selector || !action.value) {
          throw new Error('Sélecteur ou valeur manquant')
        }
        this.log(`Remplissage du champ ${action.selector}`)
        await this.page.fill(action.selector, action.value)
        break

      case 'click':
        if (!action.selector) throw new Error('Sélecteur manquant')
        this.log(`Clic sur ${action.selector}`)
        await this.page.click(action.selector)
        break

      case 'screenshot':
        this.log('Capture d\'écran')
        const screenshot = await this.page.screenshot({ fullPage: true })
        this.screenshots.push(screenshot.toString('base64'))
        break

      case 'wait':
        const timeout = action.timeout || 2000
        this.log(`Attente de ${timeout}ms`)
        await this.page.waitForTimeout(timeout)
        break

      case 'extract':
        if (!action.selector) throw new Error('Sélecteur manquant')
        this.log(`Extraction de données depuis ${action.selector}`)
        const content = await this.page.textContent(action.selector)
        this.log(`Données extraites: ${content}`)
        break

      default:
        throw new Error(`Type d'action inconnu: ${action.type}`)
    }
  }

  async navigateImpots(credentials: { username: string; password: string }): Promise<NavigationResult> {
    const task: NavigationTask = {
      targetSite: 'impots.gouv.fr',
      credentials,
      actions: [
        { type: 'navigate', url: 'https://www.impots.gouv.fr/accueil' },
        { type: 'screenshot' },
        { type: 'click', selector: 'a[href*="connexion"]' },
        { type: 'wait', timeout: 2000 },
        { type: 'fill', selector: 'input[name="username"]', value: credentials.username },
        { type: 'fill', selector: 'input[name="password"]', value: credentials.password },
        { type: 'screenshot' },
        { type: 'click', selector: 'button[type="submit"]' },
        { type: 'wait', timeout: 3000 },
        { type: 'screenshot' },
      ],
    }

    return this.executeTask(task)
  }

  async navigateAmeli(credentials: { username: string; password: string }): Promise<NavigationResult> {
    const task: NavigationTask = {
      targetSite: 'ameli.fr',
      credentials,
      actions: [
        { type: 'navigate', url: 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/assure' },
        { type: 'screenshot' },
        { type: 'fill', selector: 'input[id*="connexion_ct_ni"]', value: credentials.username },
        { type: 'fill', selector: 'input[type="password"]', value: credentials.password },
        { type: 'screenshot' },
        { type: 'click', selector: 'button[id*="connexion_bt_valider"]' },
        { type: 'wait', timeout: 3000 },
        { type: 'screenshot' },
      ],
    }

    return this.executeTask(task)
  }

  async navigateCAF(credentials: { username: string; password: string }): Promise<NavigationResult> {
    const task: NavigationTask = {
      targetSite: 'caf.fr',
      credentials,
      actions: [
        { type: 'navigate', url: 'https://www.caf.fr/' },
        { type: 'screenshot' },
        { type: 'click', selector: 'a[href*="login"]' },
        { type: 'wait', timeout: 2000 },
        { type: 'fill', selector: 'input[name="numeroAllocataire"]', value: credentials.username },
        { type: 'fill', selector: 'input[name="codePin"]', value: credentials.password },
        { type: 'screenshot' },
        { type: 'click', selector: 'button[type="submit"]' },
        { type: 'wait', timeout: 3000 },
        { type: 'screenshot' },
      ],
    }

    return this.executeTask(task)
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString()
    this.logs.push(`[${timestamp}] ${message}`)
    console.log(`[PlaywrightAgent] ${message}`)
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close()
        this.page = null
      }
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
      this.log('Nettoyage effectué')
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error)
    }
  }
}

export async function executeAutomaticNavigation(
  site: string,
  credentials: { username: string; password: string }
): Promise<NavigationResult> {
  const agent = new PlaywrightAgent()

  try {
    switch (site) {
      case 'impots.gouv.fr':
        return await agent.navigateImpots(credentials)
      
      case 'ameli.fr':
        return await agent.navigateAmeli(credentials)
      
      case 'caf.fr':
        return await agent.navigateCAF(credentials)
      
      default:
        throw new Error(`Site non supporté: ${site}`)
    }
  } finally {
    await agent.cleanup()
  }
}
