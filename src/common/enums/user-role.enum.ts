export enum UserRole {
  ADMIN = 'admin',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
  // Restricted admin-adjacent role: events + registrants + emailing
  // registrants only. No access to mentee/mentor management, cohorts, or the
  // general broadcast feature — enforced purely by which endpoints list this
  // role in @Roles(), never added alongside UserRole.ADMIN on anything else.
  COMMUNITY_MANAGER = 'community_manager',
}
