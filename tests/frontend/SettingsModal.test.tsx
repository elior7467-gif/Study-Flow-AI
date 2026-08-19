import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from '../../src/components/settings/SettingsModal';
import '@testing-library/jest-dom';

// Mock motion to bypass animations which can be tricky in JSDOM
jest.mock('motion/react', () => ({
  m: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    soundEnabled: true,
    onToggleSound: jest.fn(),
    isDarkMode: false,
    onToggleDarkMode: jest.fn(),
    isTeacherMode: false,
    onToggleTeacherMode: jest.fn(),
    onClearData: jest.fn(),
    onSignOut: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render correctly when isOpen is true', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('should call onToggleSound when sound button is clicked', () => {
    render(<SettingsModal {...defaultProps} />);
    const soundButton = screen.getByText('Sound Effects').closest('button');
    fireEvent.click(soundButton!);
    expect(defaultProps.onToggleSound).toHaveBeenCalledTimes(1);
  });

  it('should call onClearData and onClose when clear data is clicked', async () => {
    defaultProps.onClearData.mockResolvedValueOnce(undefined);
    render(<SettingsModal {...defaultProps} />);
    
    const clearButton = screen.getByText('Clear Chat History').closest('button');
    fireEvent.click(clearButton!);

    // Should change text to Clearing...
    expect(screen.getByText('Clearing...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(defaultProps.onClearData).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onSignOut when sign out is clicked', () => {
    render(<SettingsModal {...defaultProps} />);
    const signOutBtn = screen.getByText('Sign Out').closest('button');
    fireEvent.click(signOutBtn!);
    expect(defaultProps.onSignOut).toHaveBeenCalledTimes(1);
  });
});
