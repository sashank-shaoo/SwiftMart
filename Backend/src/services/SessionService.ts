import RedisService from "./RedisService";
import logger from "../config/logger";

/**
 * Session Service using Redis
 * Store user sessions in Redis for distribution and persistence
 */

interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  lastAccess: number;
}

class SessionService {
  private readonly SESSION_PREFIX = "session:";
  private readonly SESSION_TTL = 30 * 24 * 3600; // 30 days

  /**
   * Get session key
   */
  private getSessionKey(sessionId: string): string {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    userData: Omit<SessionData, "createdAt" | "lastAccess">,
  ): Promise<boolean> {
    if (!RedisService.isAvailable()) return false;

    const sessionData: SessionData = {
      ...userData,
      createdAt: Date.now(),
      lastAccess: Date.now(),
    };

    const key = this.getSessionKey(sessionId);
    const success = await RedisService.set(key, sessionData, this.SESSION_TTL);

    if (success) {
      logger.debug(`[Session CREATE] User ${userData.userId}`);
    }

    return success;
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    if (!RedisService.isAvailable()) return null;

    const key = this.getSessionKey(sessionId);
    const session = await RedisService.get<SessionData>(key);

    if (session) {
      // Update last access time
      session.lastAccess = Date.now();
      await RedisService.set(key, session, this.SESSION_TTL);
      logger.debug(`[Session ACCESS] User ${session.userId}`);
    }

    return session;
  }

  /**
   * Delete a session (logout)
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const key = this.getSessionKey(sessionId);
    const success = await RedisService.del(key);

    if (success) {
      logger.debug(`[Session DELETE] ${sessionId}`);
    }

    return success;
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    // Note: This requires scanning all sessions - expensive operation
    // Better to track user sessions separately if needed frequently
    const pattern = `${this.SESSION_PREFIX}*`;
    const deleted = await RedisService.delPattern(pattern);
    logger.info(`[Session DELETE ALL] User ${userId}: ${deleted} sessions`);
    return deleted;
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string): Promise<boolean> {
    const key = this.getSessionKey(sessionId);
    return await RedisService.expire(key, this.SESSION_TTL);
  }

  /**
   * Check if session exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    const key = this.getSessionKey(sessionId);
    return await RedisService.exists(key);
  }
}

export default new SessionService();
