import { PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { fetchPools } from '../server/batchProcessor';
import { createConnection, safelyCloseConnection } from '../server/connectionManager';

// Mock the DLMM module
jest.mock('../dlmm');

describe('DLMM Batch Queries', () => {
  // Set a longer timeout for this test as it may take a while
  jest.setTimeout(300000); // 5 minutes
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should fetch and process DLMM pools in batches', async () => {
    // Mock data
    const mockPoolAddresses = Array(20).fill(0).map((_, i) => ({
      publicKey: new PublicKey(Buffer.from(`pool${i}`.padEnd(32, '0'))),
      account: {}
    }));
    
    const mockActiveBin = {
      binId: 100,
      price: '1000000000',
    };
    
    const mockFeeInfo = {
      baseFeeRatePercentage: '0.1',
      maxFeeRatePercentage: '0.5',
      protocolFeePercentage: '0.01',
    };
    
    // Mock DLMM.getLbPairs
    (DLMM.getLbPairs as jest.Mock).mockResolvedValue(mockPoolAddresses);
    
    // Mock DLMM.create
    const mockDlmm = {
      getActiveBin: jest.fn().mockResolvedValue(mockActiveBin),
      getFeeInfo: jest.fn().mockReturnValue(mockFeeInfo),
      getDynamicFee: jest.fn().mockReturnValue('0.2'),
      fromPricePerLamport: jest.fn().mockReturnValue('1.5'),
      pubkey: new PublicKey(Buffer.from('mockpubkey'.padEnd(32, '0'))),
      tokenX: {
        publicKey: new PublicKey(Buffer.from('tokenx'.padEnd(32, '0'))),
        decimal: 9,
        reserve: new PublicKey(Buffer.from('reservex'.padEnd(32, '0'))),
        amount: '1000000000',
      },
      tokenY: {
        publicKey: new PublicKey(Buffer.from('tokeny'.padEnd(32, '0'))),
        decimal: 6,
        reserve: new PublicKey(Buffer.from('reservey'.padEnd(32, '0'))),
        amount: '500000000',
      },
      lbPair: {
        binStep: 10,
        activeId: 100,
      },
    };
    
    (DLMM.create as jest.Mock).mockResolvedValue(mockDlmm);
    
    // Run the test
    const options = {
      batchSize: 5,
      concurrencyLimit: 2,
      maxRetries: 1,
      retryDelayMs: 100,
      chunkDelayMs: 100,
      cluster: 'devnet',
    };
    
    const pools = await fetchPools(options);
    
    // Assertions
    expect(pools.length).toBe(20);
    expect(DLMM.getLbPairs).toHaveBeenCalledTimes(1);
    expect(DLMM.create).toHaveBeenCalledTimes(20);
    
    // Check that each pool has the expected structure
    pools.forEach(pool => {
      expect(pool).toHaveProperty('pubkey');
      expect(pool).toHaveProperty('tokenX');
      expect(pool).toHaveProperty('tokenY');
      expect(pool).toHaveProperty('binStep');
      expect(pool).toHaveProperty('activeId');
      expect(pool).toHaveProperty('activePrice');
      expect(pool).toHaveProperty('activePriceUI');
      expect(pool).toHaveProperty('feeInfo');
      expect(pool).toHaveProperty('dynamicFee');
      expect(pool).toHaveProperty('timestamp');
    });
  });
  
  it('should handle errors when fetching pools', async () => {
    // Mock DLMM.getLbPairs to throw an error
    (DLMM.getLbPairs as jest.Mock).mockRejectedValue(new Error('Failed to fetch pools'));
    
    // Run the test and expect it to throw
    await expect(fetchPools()).rejects.toThrow('Failed to fetch pools');
  });
  
  it('should handle errors when processing pools', async () => {
    // Mock data
    const mockPoolAddresses = Array(5).fill(0).map((_, i) => ({
      publicKey: new PublicKey(Buffer.from(`pool${i}`.padEnd(32, '0'))),
      account: {}
    }));
    
    // Mock DLMM.getLbPairs
    (DLMM.getLbPairs as jest.Mock).mockResolvedValue(mockPoolAddresses);
    
    // Mock DLMM.create to throw for some pools
    (DLMM.create as jest.Mock).mockImplementation((_, pubkey) => {
      if (pubkey.toBase58() === mockPoolAddresses[2].publicKey.toBase58()) {
        throw new Error('Failed to create DLMM');
      }
      
      return {
        getActiveBin: jest.fn().mockResolvedValue({ binId: 100, price: '1000000000' }),
        getFeeInfo: jest.fn().mockReturnValue({
          baseFeeRatePercentage: '0.1',
          maxFeeRatePercentage: '0.5',
          protocolFeePercentage: '0.01',
        }),
        getDynamicFee: jest.fn().mockReturnValue('0.2'),
        fromPricePerLamport: jest.fn().mockReturnValue('1.5'),
        pubkey,
        tokenX: {
          publicKey: new PublicKey(Buffer.from('tokenx'.padEnd(32, '0'))),
          decimal: 9,
          reserve: new PublicKey(Buffer.from('reservex'.padEnd(32, '0'))),
          amount: '1000000000',
        },
        tokenY: {
          publicKey: new PublicKey(Buffer.from('tokeny'.padEnd(32, '0'))),
          decimal: 6,
          reserve: new PublicKey(Buffer.from('reservey'.padEnd(32, '0'))),
          amount: '500000000',
        },
        lbPair: {
          binStep: 10,
          activeId: 100,
        },
      };
    });
    
    // Run the test
    const options = {
      batchSize: 5,
      concurrencyLimit: 2,
      maxRetries: 1,
      retryDelayMs: 100,
      chunkDelayMs: 100,
    };
    
    const pools = await fetchPools(options);
    
    // Assertions - should have 4 pools instead of 5 due to one error
    expect(pools.length).toBe(4);
  });
});