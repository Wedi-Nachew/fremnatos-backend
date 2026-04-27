/**
 * TCP Message Pattern and Event Pattern strings.
 *
 * Convention:
 *   - MessagePattern (request/response): 'service.action'
 *   - EventPattern (fire-and-forget):    'notification.event_name'
 *
 * Both the sender (Gateway/AdminService) and receiver (Microservice)
 * must use the exact same string. Centralizing them here prevents typos.
 */

// ─── AUTH SERVICE PATTERNS ─────────────────────────────────────────────────
export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  VERIFY_TOKEN: 'auth.verify_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  VERIFY_EMAIL: 'auth.verify_email',
  GET_USER_BY_ID: 'auth.get_user_by_id',
  UPDATE_ROLE: 'auth.update_role',
};

// ── User Patterns ──────────────────────────────────────────────
export const USER_PATTERNS = {
  // User profile
  CREATE_PROFILE: 'users.create_profile',
  GET_PROFILE: 'users.get_profile',
  UPDATE_PROFILE: 'users.update_profile',
  UPLOAD_PHOTO: 'users.upload_photo',
  GET_STATS: 'users.get_stats',
  GET_ALL_MEMBERS: 'users.get_all_members',
  UPDATE_STATUS: 'users.update_status',

  // Expert membership applications
  APPLY_MEMBERSHIP: 'membership.apply',
  GET_MEMBERSHIP: 'membership.get_by_user',
  GET_ALL_APPLICATIONS: 'membership.get_all',
  REVIEW_MEMBERSHIP: 'membership.review',
  GET_MEMBERSHIP_STATS: 'membership.get_stats',
};

// ── Content Patterns ───────────────────────────────────────────
export const CONTENT_PATTERNS = {
  // Posts
  POSTS_CREATE: 'posts.create',
  POSTS_FIND_ALL: 'posts.find_all',
  POSTS_FIND_BY_ID: 'posts.find_by_id',
  POSTS_FIND_BY_SLUG: 'posts.find_by_slug',
  POSTS_UPDATE: 'posts.update',
  POSTS_DELETE: 'posts.delete',
  POSTS_INCREMENT_VIEWS: 'posts.increment_views',
  // Events
  EVENTS_CREATE: 'events.create',
  EVENTS_FIND_ALL: 'events.find_all',
  EVENTS_FIND_BY_ID: 'events.find_by_id',
  EVENTS_UPDATE: 'events.update',
  EVENTS_DELETE: 'events.delete',
  // Comments
  COMMENTS_CREATE: 'comments.create',
  COMMENTS_FIND_BY_POST: 'comments.find_by_post',
  COMMENTS_DELETE: 'comments.delete',
  COMMENTS_APPROVE: 'comments.approve',
  COMMENTS_GET_PENDING: 'comments.get_pending',
  // Stats
  CONTENT_GET_STATS: 'content.get_stats',
};

// ── Requests Patterns ──────────────────────────────────────────
export const REQUESTS_PATTERNS = {
  SUBMIT_CONTACT: 'requests.submit_contact',
  SUBMIT_PARTNERSHIP: 'requests.submit_partnership',
  SUBMIT_VOLUNTEER: 'requests.submit_volunteer',
  SUBMIT_FUNDRAISE: 'requests.submit_fundraise',
  SUBMIT_MEMBERSHIP: 'requests.submit_membership',
  GET_ALL: 'requests.get_all',
  GET_BY_ID: 'requests.get_by_id',
  UPDATE_STATUS: 'requests.update_status',
  GET_STATS: 'requests.get_stats',
};

// ── Admin Patterns ─────────────────────────────────────────────
export const ADMIN_PATTERNS = {
  GET_DASHBOARD_STATS: 'admin.get_dashboard_stats',
  GET_REQUESTS: 'admin.get_requests',
  GET_REQUEST_BY_ID: 'admin.get_request_by_id',
  UPDATE_REQUEST_STATUS: 'admin.update_request_status',
  GET_MEMBERS: 'admin.get_members',
  UPDATE_MEMBER_STATUS: 'admin.update_member_status',
  GET_PENDING_COMMENTS: 'admin.get_pending_comments',
  APPROVE_COMMENT: 'admin.approve_comment',
  DELETE_COMMENT: 'admin.delete_comment',
};

// ── Notification Event Patterns ────────────────────────────────
export const NOTIFICATION_EVENTS = {
  // Auth events
  WELCOME: 'notification.welcome',

  // Membership events
  MEMBERSHIP_RECEIVED: 'notification.membership_received',
  MEMBERSHIP_STATUS_UPDATED: 'notification.membership_status_updated',

  // General request events
  REQUEST_RECEIVED: 'notification.request_received',
  REQUEST_STATUS_UPDATED: 'notification.request_status_updated',

  // Content events (future)
  NEW_POST: 'notification.new_post',
};
