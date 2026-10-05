---
description: Conventions for implementing moderation features including mod_ prefixed database fields, moderation status checks in queries, content visibility logic, and user suspension/ban handling
globs:
alwaysApply: false
---

# Moderation System Conventions

## Overview

This reference defines the conventions for implementing moderation features across the codebase.

## Database Field Naming Convention

### Prefix: `mod_`

All moderation-related database fields MUST use the `mod_` prefix to clearly distinguish them from regular business logic fields.

### Standard Moderation Fields

| Field Name             | Type      | Description                                               |
| ---------------------- | --------- | --------------------------------------------------------- |
| `mod_muted_until`      | DateTime? | When the user's mute expires (NULL = not muted)           |
| `mod_suspended_until`  | DateTime? | When the user's suspension expires (NULL = not suspended) |
| `mod_banned_at`        | DateTime? | When the user was banned (NULL = not banned)              |
| `mod_hidden_at`        | DateTime? | When content was hidden by moderator (NULL = visible)     |
| `mod_hidden_reason`    | String?   | Optional reason for hiding content                        |
| `mod_restricted_at`    | DateTime? | When entity was restricted                                |
| `mod_restricted_until` | DateTime? | When restriction expires                                  |

## Implementation Patterns

### 1. Data Access Layer

When querying for visible content, always check moderation fields:

```typescript
// Get visible posts
const visiblePosts = await db
  .selectFrom('posts')
  .where('deleted_at', 'is', null) // User deleted
  .where('mod_hidden_at', 'is', null) // Moderator hidden
  .execute();

// Get active users
const activeUsers = await db
  .selectFrom('users')
  .where('deleted_at', 'is', null)
  .where('mod_banned_at', 'is', null)
  .where(({ or, eb }) =>
    or([eb('mod_suspended_until', 'is', null), eb('mod_suspended_until', '<', new Date())])
  )
  .execute();
```

### 2. Service Layer

Always distinguish between user actions and moderator actions:

```typescript
// Check content visibility
function isContentVisible(content: Post | Comment): boolean {
  // User deleted their own content
  if (content.deleted_at) return false;

  // Moderator hid the content
  if (content.mod_hidden_at) return false;

  return true;
}

// Check user status
function getUserStatus(user: User): UserStatus {
  if (user.mod_banned_at) return 'banned';
  if (user.mod_suspended_until && user.mod_suspended_until > new Date()) return 'suspended';
  if (user.mod_muted_until && user.mod_muted_until > new Date()) return 'muted';
  return 'active';
}
```

### 3. Creating Moderation Actions

When applying moderation actions, always:

1. Create a record in `moderation_actions` table
2. Update the relevant `mod_*` field on the target entity
3. Use a transaction to ensure consistency

```typescript
// Example: Suspend a user
await db.transaction().execute(async trx => {
  // Create moderation record
  await trx
    .insertInto('moderation_actions')
    .values({
      type: 'SUSPEND',
      moderator_id: moderatorId,
      user_id: targetUserId,
      reason: reason,
      expires_at: expiresAt,
    })
    .execute();

  // Update user's moderation status
  await trx
    .updateTable('users')
    .set({ mod_suspended_until: expiresAt })
    .where('id', '=', targetUserId)
    .execute();
});
```

## Querying Guidelines

### 1. Always Include Moderation Checks

Never query content without checking moderation status:

```typescript
// ❌ BAD - Missing moderation check
const posts = await db.selectFrom('posts').where('group_id', '=', groupId).execute();

// ✅ GOOD - Includes moderation check
const posts = await db
  .selectFrom('posts')
  .where('group_id', '=', groupId)
  .where('mod_hidden_at', 'is', null)
  .execute();
```

### 2. Use Helper Functions

Create reusable helper functions for common moderation checks:

```typescript
// In shared/db/helpers/moderation.ts
export function excludeModeratedContent<T extends string>(qb: SelectQueryBuilder<any, T, any>) {
  return qb.where('mod_hidden_at', 'is', null);
}

export function excludeBannedUsers<T extends string>(qb: SelectQueryBuilder<any, T, any>) {
  return qb.where('mod_banned_at', 'is', null);
}

// Usage
const posts = await excludeModeratedContent(
  db.selectFrom('posts').where('group_id', '=', groupId)
).execute();
```

## Error Messages

When content is moderated, provide appropriate error messages:

```typescript
// User tries to access hidden content
if (post.mod_hidden_at) {
  throw new ApiError('CONTENT_MODERATED', 'This content has been hidden by moderators');
}

// User tries to perform action while suspended
if (user.mod_suspended_until && user.mod_suspended_until > new Date()) {
  throw new ApiError(
    'USER_SUSPENDED',
    `Your account is suspended until ${user.mod_suspended_until.toISOString()}`
  );
}
```

## Search Patterns

To find all moderation logic in the codebase:

- Search for `mod_` to find all moderation fields
- Search for `moderation_actions` to find moderation action logic
- Search for `ModerationType` to find moderation type usage
