import { registerUser, loginUser, isLoggedIn, getCurrentUser, logoutUser, userExists } from '../utils/auth';

describe('Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('creates a new user successfully', async () => {
      const result = await registerUser('testuser', 'password123');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('cbc-tutor-user', expect.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('cbc-tutor-session', 'testuser');
    });

    it('fails if user already exists', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('{"username":"existing"}');
      
      const result = await registerUser('testuser', 'password123');
      
      expect(result).toBe(false);
    });
  });

  describe('loginUser', () => {
    it('logs in with correct credentials', async () => {
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword',
        salt: 'testsalt'
      };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));
      
      // Mock crypto.subtle.digest
      Object.defineProperty(global, 'crypto', {
        value: {
          subtle: {
            digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
          },
          getRandomValues: jest.fn().mockReturnValue(new Uint8Array(16))
        }
      });

      const result = await loginUser('testuser', 'password123');
      
      expect(result).toBe(true);
    });

    it('fails with incorrect credentials', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const result = await loginUser('testuser', 'wrongpassword');
      
      expect(result).toBe(false);
    });
  });

  describe('session management', () => {
    it('checks if user is logged in', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('testuser');
      
      expect(isLoggedIn()).toBe(true);
    });

    it('gets current user', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('testuser');
      
      expect(getCurrentUser()).toBe('testuser');
    });

    it('logs out user', () => {
      logoutUser();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('cbc-tutor-session');
    });

    it('checks if user exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('{"username":"test"}');
      
      expect(userExists()).toBe(true);
    });
  });
});