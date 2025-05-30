import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimatedDreamGrid from '@/components/AnimatedDreamGrid';
import { SearchProvider } from '@/context/search-context';

// Mock the DreamCard component
vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockDreamCard({ dream }: any) {
      return (
        <div data-testid={`dream-card-${dream.id}`}>
        <div>{dream.title}</div>
        <div>{dream.original_text}</div>
        </div>
      );
    };
  }
}));

describe('AnimatedDreamGrid Filtering', () => {
  const mockDreams = [
    {
      id: '1',
      original_text: 'I was flying over mountains',
      title: 'Flying Dream',
      tags: ['flying', 'mountain'],
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      original_text: 'I was swimming in the ocean',
      title: 'Ocean Dream',
      tags: ['water', 'ocean'],
      created_at: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      original_text: 'I was running in a forest',
      title: 'Forest Dream',
      tags: ['forest', 'running'],
      created_at: '2023-01-03T00:00:00.000Z',
    },
  ];

  it('should render all dreams by default', () => {
    render(<SearchProvider><AnimatedDreamGrid dreams={mockDreams} /></SearchProvider>);
    
    // Check that all dreams are rendered
    mockDreams.forEach(dream => {
      expect(screen.getByTestId(`dream-card-${dream.id}`)).toBeInTheDocument();
    });
  });
  
  it('should render placeholder when no dreams are provided', () => {
    render(<SearchProvider><AnimatedDreamGrid dreams={[]} /></SearchProvider>);
    
    // Check for placeholder
    expect(screen.getByTestId('dream-card-placeholder')).toBeInTheDocument();
  });
  
  // Will be added after implementing filtering
  it.todo('should filter dreams based on search term');
});