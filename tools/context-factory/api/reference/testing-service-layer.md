---
description: Testing patterns for service layer including dependency injection mocking, mock utilities, test structure, and assertion patterns for business logic orchestration
globs: **/services/**/*.test.ts, **/_services/**/*.test.ts
alwaysApply: false
---

# Guidelines for Testing the Service Layer

## Purpose & Overview

This reference defines the standard patterns for implementing tests for the service layer. Service layer tests focus on testing business logic orchestration, dependency coordination, and error handling without hitting real databases or external services.

## Test File Structure

### Shared Domain

```
src/services/[domain]/
├── [operation]-[entity].ts       # Service implementation
├── [operation]-[entity].test.ts  # Service tests
└── [subfolder]/                  # Any subfolder (utils, helpers, etc.)
    ├── [file-name].ts            # Subfolder implementations
    └── [file-name].test.ts       # Subfolder tests
```

### Feature Domain

```
src/features/[feature-name]/
└── _services/
    ├── [operation]-[entity].ts       # Service implementation
    ├── [operation]-[entity].test.ts  # Service tests
    └── [subfolder]/                  # Any subfolder
        └── [file-name].test.ts       # Subfolder tests
```

## Key Test Utilities

### Mock Database Client

Import the mock database client for service tests:

```typescript
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';

const { dbClient, dbClientTransaction } = mockDbClient;
```

- `dbClient`: Regular mock database client
- `dbClientTransaction`: Mock with transaction wrapper for transactional operations

### Mock Session

Import the mock session for authenticated service tests:

```typescript
import { mockSession } from '@/middlewares/__test-utils__/mock-openapi-hono';
```

### Fake Data Makers

Reuse `makeFake*` utilities from the data layer:

```typescript
import { makeFakeUser } from '@/data/users/__test-utils__/make-fake-user';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
```

## Mock Dependencies Pattern

Services use dependency injection with default values. Tests inject mock dependencies:

### Service Implementation Pattern

```typescript
// [operation]-[entity].ts
export type Get[Entity]ServiceDependencies = {
  getUserData: typeof getUserData;
  get[Entity]Data: typeof get[Entity]Data;
};

export type Get[Entity]ServiceArgs = {
  dbClient: DbClient;
  payload: { session: Session };
  dependencies?: Get[Entity]ServiceDependencies;
};

export async function get[Entity]Service({
  dbClient,
  payload,
  dependencies = {
    getUserData,
    get[Entity]Data,
  },
}: Get[Entity]ServiceArgs) {
  // Implementation using dependencies
  const user = await dependencies.getUserData({ dbClient, id: payload.session.accountId });
  const entity = await dependencies.get[Entity]Data({ dbClient, userId: user.id });
  return entity;
}
```

### Test Mock Setup Pattern

```typescript
// [operation]-[entity].test.ts
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { mockSession } from '@/middlewares/__test-utils__/mock-openapi-hono';
import { makeFakeUser } from '@/data/users/__test-utils__/make-fake-user';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get[Entity]Service } from './get-[entity]';

const { dbClient } = mockDbClient;

// Create mock dependencies object
const mockDependencies = {
  getUserData: vi.fn(),
  get[Entity]Data: vi.fn(),
};

// Create mock data
const mockUser = makeFakeUser();
const mock[Entity] = {
  id: 'entity-123',
  // ... entity fields
};

describe('get[Entity]Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tests go here
});
```

## Test Structure Pattern

### Standard Test Organization

```typescript
describe('[operation][Entity]Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks with default values if needed
    mockDependencies.someFunction.mockResolvedValue(defaultValue);
  });

  describe('success scenarios', () => {
    it('should successfully [action] when [condition]', async () => {
      // Setup
      mockDependencies.getUserData.mockResolvedValue(mockUser);
      mockDependencies.get[Entity]Data.mockResolvedValue(mock[Entity]);

      // Execute
      const result = await get[Entity]Service({
        dbClient,
        payload: { session: mockSession },
        dependencies: mockDependencies,
      });

      // Assert return value
      expect(result).toEqual(mock[Entity]);

      // Assert function calls
      expect(mockDependencies.getUserData).toHaveBeenCalledWith({
        dbClient,
        id: mockSession.accountId,
      });
      expect(mockDependencies.get[Entity]Data).toHaveBeenCalledWith({
        dbClient,
        userId: mockUser.id,
      });
    });
  });

  describe('error scenarios', () => {
    it('should throw NotFoundError when user is not found', async () => {
      // Setup error condition
      mockDependencies.getUserData.mockRejectedValue(
        new NotFoundError('User not found.')
      );

      // Execute and assert
      await expect(
        get[Entity]Service({
          dbClient,
          payload: { session: mockSession },
          dependencies: mockDependencies,
        })
      ).rejects.toThrow(new NotFoundError('User not found.'));

      // Assert subsequent functions were not called
      expect(mockDependencies.get[Entity]Data).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      mockDependencies.getUserData.mockResolvedValue(mockUser);
      mockDependencies.get[Entity]Data.mockRejectedValue(
        new ForbiddenError('Access denied.')
      );

      await expect(
        get[Entity]Service({
          dbClient,
          payload: { session: mockSession },
          dependencies: mockDependencies,
        })
      ).rejects.toThrow(new ForbiddenError('Access denied.'));
    });
  });

  describe('edge cases', () => {
    it('should handle null optional fields', async () => {
      // Test specific edge cases
    });
  });
});
```

## Assertion Patterns

### Call Verification

```typescript
// Verify function was called with specific arguments
expect(mockDependencies.getUserData).toHaveBeenCalledWith({
  dbClient,
  id: mockSession.accountId,
});

// Verify function was NOT called
expect(mockDependencies.someFunction).not.toHaveBeenCalled();

// Verify multiple calls in order
expect(mockDependencies.generateJWT).toHaveBeenNthCalledWith(1, {
  payload: { accountId, sub, iss, aud },
  secretOrPrivateKey: expect.any(String),
  signOptions: { expiresIn: '30d' },
});

// Verify call count
expect(mockDependencies.updateData).toHaveBeenCalledTimes(2);
```

### Return Value Assertions

```typescript
// Exact equality
expect(result).toEqual(expectedObject);

// Partial matching
expect(result).toMatchObject({ id: 'expected-id' });

// Property checking
expect(result.id).toBe('specific-value');

// Array assertions
expect(result).toContainEqual({ key: value });
expect(result).toHaveLength(3);

// Floating point comparison
expect(result.amount).toBeCloseTo(333.33, 2);
```

### Error Assertions

```typescript
// Async error throwing
await expect(
  serviceFunction({ dbClient, payload, dependencies: mockDependencies })
).rejects.toThrow(new ForbiddenError('message'));

// Error type checking
await expect(serviceFunction({...})).rejects.toBeInstanceOf(NotFoundError);

// Error message matching
await expect(serviceFunction({...})).rejects.toThrow(/pattern/);
```

## Testing Transactional Services

For services that use database transactions:

```typescript
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';

const { dbClientTransaction } = mockDbClient;

describe('transactionalService', () => {
  it('should execute within transaction', async () => {
    mockDependencies.createData.mockResolvedValue(createdEntity);

    const result = await transactionalService({
      dbClient: dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(result).toEqual(createdEntity);
  });
});
```

## Testing Pure Functions

For pure functions without external dependencies (no mocking needed):

```typescript
// [subfolder]/[function-name].test.ts
import { describe, expect, it } from 'vitest';
import { calculateSomething } from './calculate-something';

describe('calculateSomething', () => {
  describe('basic calculations', () => {
    it('should calculate correctly with valid inputs', () => {
      const result = calculateSomething({
        baseAmount: 1000,
        discount: 10,
      });

      expect(result.discountedAmount).toBe(900);
      expect(result.savings).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      const result = calculateSomething({
        baseAmount: 0,
        discount: 10,
      });

      expect(result.discountedAmount).toBe(0);
    });

    it('should throw on invalid inputs', () => {
      expect(() =>
        calculateSomething({
          baseAmount: -100,
          discount: 10,
        })
      ).toThrow('Invalid amount');
    });
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent with its own mock setup via `beforeEach`
2. **Clear Mocks**: Always use `vi.clearAllMocks()` in `beforeEach` to reset mock state
3. **Focused Testing**: Test one behavior per test case
4. **Realistic Data**: Use `makeFake*` utilities with realistic test data
5. **Error Coverage**: Test both success and all error paths
6. **Call Verification**: Verify both return values AND function call parameters
7. **No Shared State**: Avoid sharing mutable state between tests
8. **Descriptive Names**: Use clear `it()` descriptions explaining expected behavior

## Important Notes

- Don't forget to run `pnpm test run <file_path>` after creating tests
- Service tests should NOT hit the real database - use mocked dependencies
- Reuse existing `makeFake*` utilities from the data layer
- For integration tests that need real database, see `testing-data-access-layer.md`
