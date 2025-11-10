// Fix for issue #3624: Location statistics broken when tracking IPv6 clients
// File: src/lib/__tests__/detect.test.ts

// Add IPv6 test cases (around line 113):
/*
it('should handle IPv6 addresses correctly', async () => {
  (isLocalhost as jest.Mock).mockResolvedValue(false);
  
  const mockMaxmindDb = {
    get: jest.fn().mockReturnValue({
      country: { iso_code: 'US' },
      subdivisions: [{ iso_code: 'CA' }],
      city: { names: { en: 'Los Angeles' } },
    }),
  };
  
  (maxmind.open as jest.Mock).mockResolvedValue(mockMaxmindDb);
  
  // Test IPv6 with port
  const result1 = await getLocation('[2001:db8::1]:8080', new Headers(), false);
  expect(result1).toEqual({
    country: 'US',
    region: 'US-CA',
    city: 'Los Angeles',
  });
  
  // Test IPv6 without port
  const result2 = await getLocation('2001:db8::1', new Headers(), false);
  expect(result2).toEqual({
    country: 'US',
    region: 'US-CA',
    city: 'Los Angeles',
  });
  
  // Verify that the MaxMind database is called with the cleaned IP
  expect(mockMaxmindDb.get).toHaveBeenCalledWith('2001:db8::1');
});
*/