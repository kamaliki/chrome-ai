import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

describe('CBC Tutor App', () => {
  beforeEach(() => {
    // Mock user not logged in
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  it('renders the welcome page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Welcome to CBC Tutor')).toBeInTheDocument();
  });

  it('shows app features on welcome page', () => {
    render(<App />);
    expect(screen.getByText('Smart Note Editor')).toBeInTheDocument();
    expect(screen.getByText('Language Detection')).toBeInTheDocument();
    expect(screen.getByText('AI Summarization')).toBeInTheDocument();
    expect(screen.getByText('Understanding Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Smart Translation')).toBeInTheDocument();
    expect(screen.getByText('Secure Authentication')).toBeInTheDocument();
  });

  it('shows get started button', () => {
    render(<App />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});