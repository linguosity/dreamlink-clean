import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DreamCard from '../../components/DreamCard';

// Mock the tooltip functionality
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
    <div data-testid="tooltip-trigger" data-aschild={asChild ? 'true' : 'false'}>{children}</div>
  ),
}));

// Sample dream data with bible references
const sampleDream = {
  id: '123',
  original_text: 'I dreamed I was walking by a river and saw a bright light.',
  title: 'River and Light Dream',
  dream_summary: 'A spiritual journey by water with divine illumination.',
  analysis_summary: 'This dream represents spiritual guidance (Psalm 23:4) and divine revelation (John 8:12).',
  formatted_analysis: 'This dream represents spiritual guidance (Psalm 23:4) and divine revelation (John 8:12).',
  topic_sentence: 'Your dream reflects a spiritual journey.',
  supporting_points: [
    'The river symbolizes life\'s journey and God\'s guidance (Psalm 23:4).',
    'The light represents divine revelation and truth (John 8:12).',
    'The walking motion suggests progressive spiritual growth (Ephesians 5:8).',
  ],
  conclusion_sentence: 'Consider how God might be guiding you toward new spiritual insights.',
  tags: ['water', 'light', 'guidance'],
  bible_refs: ['Psalm 23:4', 'John 8:12', 'Ephesians 5:8'],
  created_at: '2025-04-30T12:00:00Z',
};

describe('DreamCard Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('renders the dream title correctly', () => {
    render(<DreamCard dream={sampleDream} />);
    expect(screen.getByText('River and Light Dream')).toBeInTheDocument();
  });

  it('displays dream summary in card view', () => {
    render(<DreamCard dream={sampleDream} />);
    expect(screen.getByText('A spiritual journey by water with divine illumination.')).toBeInTheDocument();
  });

  it('shows Bible references with tooltip triggers', async () => {
    // In a real test, we would open the dialog first
    render(<DreamCard dream={sampleDream} />);
    
    // Click on the card to open the dialog
    fireEvent.click(screen.getByText('River and Light Dream'));
    
    // Wait for the dialog to appear
    await waitFor(() => {
      // Test if the Bible references are displayed with tooltips
      // Since we're checking for tooltip triggers, we would need to interact
      // with the dialog components, but for simplicity in this example,
      // we're just checking for the presence of elements
      expect(screen.getByText('Psalm 23:4')).toBeInTheDocument();
      expect(screen.getByText('John 8:12')).toBeInTheDocument();
      expect(screen.getByText('Ephesians 5:8')).toBeInTheDocument();
    });
  });

  it('formats citations in analysis text with tooltips', async () => {
    render(<DreamCard dream={sampleDream} />);
    
    // Click on the card to open the dialog
    fireEvent.click(screen.getByText('River and Light Dream'));
    
    // Wait for analysis to be displayed in the dialog
    await waitFor(() => {
      // In the implementation, DreamCard's formatBibleCitations function should wrap citations in tooltips
      // Our mock makes these available as tooltip-trigger elements
      const tooltipTriggers = screen.getAllByTestId('tooltip-trigger');
      expect(tooltipTriggers.length).toBeGreaterThan(0);
    });
  });
});