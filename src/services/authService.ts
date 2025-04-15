import { generateTintsAndShades } from '../utils/colorUtils';

interface User {
  id: string;
  email: string;
  name: string;
  paletteCount: number;
  lastLogin: string;
  signupDate: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'orange_tokens_user';
  // Replace this with your actual Google OAuth client ID
  private readonly GOOGLE_CLIENT_ID = '299217406191-238ehmrccsheem2hn3qilk16h8e34i30.apps.googleusercontent.com';

  private constructor() {
    // Load user from storage if exists
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage(): Promise<User | null> {
    try {
      const storedUser = await figma.clientStorage.getAsync(this.STORAGE_KEY);
      if (storedUser) {
        this.currentUser = storedUser as User;
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      return null;
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getGoogleClientId(): string {
    return this.GOOGLE_CLIENT_ID;
  }

  public async handleGoogleSignIn(credential: string): Promise<User> {
    try {
      // Parse the JWT token
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const now = new Date().toISOString();
      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        paletteCount: 0,
        lastLogin: now,
        signupDate: now
      };

      // Check if user already exists
      const existingUser = await this.loadUserFromStorage();
      if (existingUser) {
        user.signupDate = existingUser.signupDate;
        user.paletteCount = existingUser.paletteCount;
      }

      this.currentUser = user;
      await figma.clientStorage.setAsync(this.STORAGE_KEY, user);
      
      return user;
    } catch (error) {
      console.error('Error handling Google sign in:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  public async incrementPaletteCount(): Promise<void> {
    if (this.currentUser) {
      this.currentUser.paletteCount++;
      await figma.clientStorage.setAsync(this.STORAGE_KEY, this.currentUser);
    }
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public async signOut(): Promise<void> {
    this.currentUser = null;
    await figma.clientStorage.deleteAsync(this.STORAGE_KEY);
  }
}

export const authService = AuthService.getInstance(); 