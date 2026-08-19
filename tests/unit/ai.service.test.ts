/** @jest-environment node */
import { AiService } from '../../server/services/ai.service';
import { config } from '../../server/config/env';

// Mock dependencies
jest.mock('../../server/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null })
  },
  getAuthSupabase: jest.fn()
}));

jest.mock('../../server/utils/pipeline', () => ({
  getExtractor: jest.fn().mockResolvedValue(async () => ({ data: new Float32Array(384).fill(0.1) }))
}));

// Provide fake config keys
config.primaryAiApiKey = 'test-primary';
config.primaryAiBaseUrl = 'http://test-primary.local';
config.secondaryAiApiKey = 'test-secondary';
config.secondaryAiBaseUrl = 'http://test-secondary.local';

describe('AiService', () => {
  let primaryMock: jest.SpyInstance;
  let secondaryMock: jest.SpyInstance;

  beforeEach(() => {
    // We can spy on getPrimaryClient and getSecondaryClient
    primaryMock = jest.spyOn(AiService as any, 'getPrimaryClient');
    secondaryMock = jest.spyOn(AiService as any, 'getSecondaryClient');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fallback to secondary client when primary fails', async () => {
    // Mock primary throwing an error
    primaryMock.mockReturnValue({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('Primary API down'))
        }
      }
    } as any);

    // Mock secondary succeeding
    const mockSuccessResponse = {
      usage: { total_tokens: 100 },
      choices: [{
        message: { content: JSON.stringify({ success: true, dummy: "data" }) }
      }]
    };

    secondaryMock.mockReturnValue({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockSuccessResponse)
        }
      }
    } as any);

    const schema = { type: 'object', properties: { success: { type: 'boolean' } } };
    
    // Call the protected fallback method via ts-ignore or casting
    const result = await (AiService as any).executeWithFallback(
      [{ role: 'user', content: 'test' }],
      schema,
      'test_schema'
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(primaryMock).toHaveBeenCalled();
    expect(secondaryMock).toHaveBeenCalled();
  });

  it('should throw Error if both primary and secondary fail', async () => {
    primaryMock.mockReturnValue({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('Primary down')) } }
    } as any);
    secondaryMock.mockReturnValue({
      chat: { completions: { create: jest.fn().mockRejectedValue(new Error('Secondary down')) } }
    } as any);

    const schema = { type: 'object', properties: { success: { type: 'boolean' } } };

    await expect((AiService as any).executeWithFallback(
      [{ role: 'user', content: 'test' }],
      schema,
      'test_schema'
    )).rejects.toThrow(/AI Engine Failure/);
  });
});
