# Messaging APIs

This document describes the first version of user messaging.

## For Users

### What exists in v1

- Any authenticated user can create a direct chat with any other user.
- Any authenticated user can create a group chat.
- The creator of a group is the initial admin.
- Group admins can add members.
- Only members of a chat can send/read messages in that chat.
- Messages support edit and logical delete.
- Chats expose unread counters per user.
- Group settings currently include only title updates.
- Group members can exit a group.
- Group admins can promote other members to admin.
- Group owner can transfer ownership/admin responsibility.

### Useful extras added for frontend

- List my chats.
- Get a single chat detail (members, roles, title, metadata).
- Mark chat as read.

### Important behavior

- Direct chats are unique per pair of users (no duplicate active direct chats).
- Deleted messages remain in timeline but with `isDeleted: true` and `content: null`.
- Group admins cannot leave a group while other active members still exist in that group.
- Unread counters ignore deleted messages and messages sent by the current user.

### Endpoints

All endpoints are under `/api/v1/chats` and require authentication.

- `GET /`:
  - Lists chats where current user is an active member.
  - Includes `unreadMessagesCount` for each chat.
  - Query: `limit` optional (1-100, default 30).

- `GET /:chatId`:
  - Returns chat details and active members.

- `POST /direct`:
  - Creates or returns existing direct chat.
  - Body:
    - `targetUserId: string`

- `POST /groups`:
  - Creates a group chat.
  - Body:
    - `title: string`
    - `userIds: string[]` optional extra members.

- `POST /:chatId/members`:
  - Adds users to a group (admin only).
  - Body:
    - `userIds: string[]`

- `POST /:chatId/messages`:
  - Sends a message in a chat.
  - Body:
    - `content: string`

- `GET /:chatId/messages`:
  - Reads paged messages in reverse chronological order.
  - First page: omit `cursor`.
  - Next pages: use the `nextCursor` returned by the previous response.
  - Query:
    - `limit` optional (1-100, default 30)
    - `cursor` optional message id

- `POST /:chatId/read`:
  - Marks all current visible messages as read for current user.
  - Resets unread count for that chat to 0.

- `PATCH /:chatId/messages/:messageId`:
  - Edits a message (sender only).
  - Body:
    - `content: string`

- `DELETE /:chatId/messages/:messageId`:
  - Logically deletes a message (sender only).

- `POST /:chatId/leave`:
  - Exits a group chat.

- `PATCH /:chatId`:
  - Updates group config (admin only).
  - Body:
    - `title: string`

- `POST /:chatId/admins/promote`:
  - Promotes an active group member to admin (admin only).
  - Body:
    - `userId: string`

- `POST /:chatId/admins/transfer`:
  - Transfers group ownership to an active member (owner only).
  - Also ensures target user is admin.
  - Body:
    - `userId: string`

## For AI

### Data model

Added Prisma enums:

- `ChatType`: `DIRECT | GROUP`
- `ChatMemberRole`: `MEMBER | ADMIN`

Added Prisma models:

- `Chat`:
  - `id`
  - `type`
  - `title` nullable
  - `createdByUserId`
  - `directUserLowId`, `directUserHighId` nullable (only for direct chats)
  - `createdAt`, `updatedAt`, `deletedAt`

- `ChatMember`:
  - `id`
  - `chatId`, `userId`
  - `role`
  - `lastReadMessageAt`
  - `joinedAt`, `updatedAt`
  - `leftAt`, `deletedAt`
  - unique `(chatId, userId)`

- `ChatMessage`:
  - `id`
  - `chatId`, `senderUserId`
  - `content`
  - `editedAt`
  - `createdAt`, `updatedAt`
  - `deletedAt`, `deletedByUserId`

### DB constraints/indexes

- Direct/group shape check constraint for `Chat`:
  - DIRECT requires `directUserLowId` and `directUserHighId` with lexicographic ordering.
  - GROUP requires both direct pair fields to be null.

- Partial unique index for direct chats:
  - Unique active pair (`directUserLowId`, `directUserHighId`) where `type='DIRECT' and deleted_at is null`.

- Message content non-empty check.

- Indexes for soft-delete access patterns and timeline reads.

### Permission model

- Active member means `leftAt is null` and `deletedAt is null` for `ChatMember`.
- Read/send messages require active membership.
- Edit/delete message requires active membership and sender ownership.
- Group member add/update-config requires role `ADMIN`.
- Admin promote requires role `ADMIN`.
- Ownership transfer requires current owner (`chat.createdByUserId`) and admin role.
- Group exit allowed for member, but admin is blocked if other active members remain.

### Pagination contract

- Message pagination is cursor-based using `message.id`.
- Sort: `createdAt desc`.
- Response includes `nextCursor` or `null`.
- Chat list includes per-chat unread count for current user.

### Response keys

New message keys added in `docs/message-keys.json`:

- `CHATS_LISTED`
- `CHAT_DETAILS`
- `DIRECT_CHAT_CREATED`
- `GROUP_CHAT_CREATED`
- `GROUP_MEMBERS_ADDED`
- `GROUP_MEMBER_ALREADY_EXISTS`
- `MESSAGE_SENT`
- `MESSAGES_READ`
- `MESSAGE_CURSOR_INVALID`
- `MESSAGE_UPDATED`
- `MESSAGE_DELETED`
- `CHAT_MARKED_AS_READ`
- `GROUP_EXITED`
- `GROUP_CONFIG_UPDATED`
- `GROUP_ADMIN_PROMOTED`
- `GROUP_ADMIN_TRANSFERRED`
