import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock the Supabase client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      })
    },
    from: vi.fn().mockImplementation((table) => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((callback) => {
        if (table === 'dream_entries') {
          return Promise.resolve(callback({
            data: [{ id: 'test-dream-id', user_id: 'test-user-id' }],
            error: null
          }));
        } else if (table === 'chatgpt_interactions') {
          return Promise.resolve(callback({
            data: null,
            error: null
          }));
        } else if (table === 'bible_citations') {
          return Promise.resolve(callback({
            data: null,
            error: null
          }));
        }
        return Promise.resolve(callback({ data: null, error: null }));
      })
    }))
  }))
}));

// Mock the OpenAI analysis function
vi.mock('../../app/api/openai-analysis/route', () => ({
  POST: vi.fn().mockImplementation(() => {
    return NextResponse.json({
      topicSentence: "Your dream reflects a spiritual journey.",
      supportingPoints: [
        "The river symbolizes life's journey (Psalm 23:4).",
        "The light represents divine revelation (John 8:12)."
      ],
      conclusionSentence: "Consider how God is guiding you.",
      analysis: "Full analysis text..."
    });
  })
}));

// Sample dream text for testing
const sampleDreamText = "I dreamed I was walking by a river and saw a bright light.";

describe('Dream Entries API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mock('next/server', () => ({
      NextResponse: {
        json: vi.fn((data) => ({
          ...data,
          headers: new Map()
        }))
      }
    }));
  });

  describe('POST Endpoint', () => {
    it('should save a new dream entry and start analysis in the background', async () => {
      // Import the handler after mocks are set up
      const { POST } = await import('../../app/api/dream-entries/route');
      
      // Create test request
      const request = new Request('http://localhost:3000/api/dream-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_text: sampleDreamText })
      });

      // Call the handler
      const response = await POST(request);
      
      // Check response
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("Dream recorded successfully")
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      // Override the auth mock for this test
      const createClientMock = await import('@/utils/supabase/server');
      (createClientMock.createClient as any).mockImplementationOnce(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null
          }),
          getSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: null
          })
        }
      }));

      const { POST } = await import('../../app/api/dream-entries/route');
      
      const request = new Request('http://localhost:3000/api/dream-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_text: sampleDreamText })
      });

      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Unauthorized")
        }),
        expect.objectContaining({ status: 401 })
      );
    });
  });

  describe('analyzeAndUpdateDream function', () => {
    it('should update the dream entry with analysis data and raw_analysis', async () => {
      // We need to test the non-exported function
      // Since we can't access it directly, we'll make a POST request and check the results
      
      // Mock Supabase's from().update() to capture the updated data
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          then: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      });
      
      const createClientMock = await import('@/utils/supabase/server');
      (createClientMock.createClient as any).mockImplementationOnce(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          }),
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null
          })
        },
        from: vi.fn().mockImplementation((table) => {
          if (table === 'dream_entries' && updateMock.mock.calls.length === 0) {
            // First call - during insert
            return {
              insert: vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockReturnThis(),
              then: vi.fn().mockImplementation((callback) => {
                return Promise.resolve(callback({
                  data: { id: 'test-dream-id', user_id: 'test-user-id' },
                  error: null
                }));
              })
            };
          } else if (table === 'dream_entries') {
            // Second call - during update
            return {
              update: updateMock,
              from: vi.fn().mockReturnThis()
            };
          } else {
            // Other tables
            return {
              insert: vi.fn().mockReturnThis(),
              then: vi.fn().mockImplementation((callback) => {
                return Promise.resolve(callback({ data: null, error: null }));
              })
            };
          }
        })
      }));

      const { POST } = await import('../../app/api/dream-entries/route');
      
      const request = new Request('http://localhost:3000/api/dream-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_text: sampleDreamText })
      });

      await POST(request);
      
      // Wait for the asynchronous background process to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Check that the update function was called with the correct data
      expect(updateMock).toHaveBeenCalled();
      
      // The first argument to update should include the raw_analysis field
      const updateArgs = updateMock.mock.calls[0][0];
      expect(updateArgs).toHaveProperty('raw_analysis');
      
      // Verify other fields
      expect(updateArgs).toHaveProperty('dream_summary');
      expect(updateArgs).toHaveProperty('topic_sentence');
      expect(updateArgs).toHaveProperty('supporting_points');
      expect(updateArgs).toHaveProperty('bible_refs');
    });
  });
});