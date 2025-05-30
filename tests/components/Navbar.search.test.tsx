import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// Mock the UserAvatar component since we're only testing search functionality
jest.mock('@/components/UserAvatar', () => {
  return function MockUserAvatar() {
    return <div data-testid="mock-user-avatar">UserAvatar</div>;
  };
});

describe('Navbar Search Functionality', () => {
  it('should render search input', () => {
    render(<Navbar />);
    
    // Find the search button/trigger
    const searchButton = screen.getByRole('button', { name: /search dreams/i });
    expect(searchButton).toBeInTheDocument();
    
    // Click to open the dropdown
    fireEvent.click(searchButton);
    
    // Check if search input appears
    const searchInput = screen.getByPlaceholderText(/search dream entries/i);
    expect(searchInput).toBeInTheDocument();
  });
  
  it('should handle search input changes without affecting other UI', () => {
    render(<Navbar />);
    
    // Open the search dropdown
    const searchButton = screen.getByRole('button', { name: /search dreams/i });
    fireEvent.click(searchButton);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText(/search dream entries/i);
    
    // Type in the search box
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Verify input value is updated
    expect(searchInput).toHaveValue('test search');
    
    // Verify the rest of the navbar remains unchanged
    const userAvatar = screen.getByTestId('mock-user-avatar');
    expect(userAvatar).toBeInTheDocument();
  });
});