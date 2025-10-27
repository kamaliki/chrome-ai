// Privacy-first local authentication using Web Crypto API
export interface User {
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: Date;
}

// Generate a random salt
async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash password with salt using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Register a new user
export async function registerUser(username: string, password: string): Promise<boolean> {
  if (localStorage.getItem('cbc-tutor-user')) {
    return false; // User already exists
  }
  
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  
  const user: User = {
    username,
    passwordHash,
    salt,
    createdAt: new Date()
  };
  
  localStorage.setItem('cbc-tutor-user', JSON.stringify(user));
  localStorage.setItem('cbc-tutor-session', username);
  return true;
}

// Login user
export async function loginUser(username: string, password: string): Promise<boolean> {
  const userData = localStorage.getItem('cbc-tutor-user');
  if (!userData) return false;
  
  const user: User = JSON.parse(userData);
  if (user.username !== username) return false;
  
  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash === user.passwordHash) {
    localStorage.setItem('cbc-tutor-session', username);
    return true;
  }
  
  return false;
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('cbc-tutor-session');
}

// Get current user
export function getCurrentUser(): string | null {
  return localStorage.getItem('cbc-tutor-session');
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem('cbc-tutor-session');
}

// Check if user exists
export function userExists(): boolean {
  return !!localStorage.getItem('cbc-tutor-user');
}