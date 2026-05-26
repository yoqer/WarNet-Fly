export enum AuditEventType {
  VOICE_COMMAND = 'VOICE_COMMAND',
  SEARCH_QUERY = 'SEARCH_QUERY',
  NAVIGATION = 'NAVIGATION',
  LOCATION_ACCESS = 'LOCATION_ACCESS',
  DEVICE_CONTROL = 'DEVICE_CONTROL',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  DATA_ACCESS = 'DATA_ACCESS',
  ERROR = 'ERROR',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: AuditEventType;
  userId?: string;
  deviceId?: string;
  action: string;
  details: Record<string, any>;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents: number = 1000;
  private remoteEndpoint?: string;

  constructor(remoteEndpoint?: string, maxEvents: number = 1000) {
    this.remoteEndpoint = remoteEndpoint;
    this.maxEvents = maxEvents;
  }

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    if (this.events.length >= this.maxEvents) {
      this.events.shift();
    }

    this.events.push(auditEvent);

    if (this.remoteEndpoint) {
      this.sendToRemote(auditEvent);
    }

    if (auditEvent.severity === 'critical') {
      this.triggerAlert(auditEvent);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToRemote(event: AuditEvent): Promise<void> {
    if (!this.remoteEndpoint) return;

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send audit event:', error);
    }
  }

  private triggerAlert(event: AuditEvent): void {
    console.error('SECURITY ALERT:', event);
  }

  getEvents(filter?: {
    type?: AuditEventType;
    severity?: string;
    userId?: string;
  }): AuditEvent[] {
    let filtered = [...this.events];

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }
    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }
    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    return filtered;
  }

  getStats() {
    return {
      totalEvents: this.events.length,
      criticalEvents: this.events.filter(e => e.severity === 'critical').length,
      failedEvents: this.events.filter(e => e.status === 'failure').length,
    };
  }

  clear(): void {
    this.events = [];
  }
}

export class DataEncryption {
  static async hashSHA256(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hash error:', error);
      throw error;
    }
  }
}

export class SecurityMonitor {
  private auditLogger: AuditLogger;
  private suspiciousActivityThreshold: number = 10;
  private lastMinuteEvents: number = 0;
  private lastMinuteTimestamp: number = 0;

  constructor(auditLogger: AuditLogger) {
    this.auditLogger = auditLogger;
  }

  checkSuspiciousActivity(): boolean {
    const now = Date.now();

    if (now - this.lastMinuteTimestamp > 60000) {
      this.lastMinuteEvents = 0;
      this.lastMinuteTimestamp = now;
    }

    this.lastMinuteEvents++;

    if (this.lastMinuteEvents > this.suspiciousActivityThreshold) {
      this.auditLogger.log({
        type: AuditEventType.SECURITY_ALERT,
        action: 'Suspicious activity detected',
        details: {
          eventsPerMinute: this.lastMinuteEvents,
          threshold: this.suspiciousActivityThreshold,
        },
        status: 'warning',
        severity: 'high',
      });
      return true;
    }

    return false;
  }

  validateInput(input: string, maxLength: number = 1000): boolean {
    if (!input || input.length > maxLength) {
      return false;
    }

    const suspiciousPatterns = [/<script/i, /javascript:/i, /eval\(/i];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        this.auditLogger.log({
          type: AuditEventType.SECURITY_ALERT,
          action: 'Suspicious input detected',
          details: { pattern: pattern.source },
          status: 'failure',
          severity: 'high',
        });
        return false;
      }
    }

    return true;
  }
}

export const auditLogger = new AuditLogger();
export const securityMonitor = new SecurityMonitor(auditLogger);
