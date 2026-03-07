import * as z from "zod";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  lastLoginMethod: text("last_login_method"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  isPremiumUser: boolean("is_premium_user").default(false).notNull(),
  isAcceptingMessages: boolean("is_accepting_messages").default(true).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
    activeTeamId: text("active_team_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable(
  "organization",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const team = pgTable(
  "team",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  (table) => [index("team_organizationId_idx").on(table.organizationId)],
);

export const teamMember = pgTable(
  "team_member",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    index("teamMember_teamId_idx").on(table.teamId),
    index("teamMember_userId_idx").on(table.userId),
  ],
);

export const member = pgTable(
  "member",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    teamId: text("team_id"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: uuid("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  teamMembers: many(teamMember),
  members: many(member),
  invitations: many(invitation),
  initiatedConversations: many(conversation, {
    relationName: "initiatedConversations",
  }),
  receivedConversations: many(conversation, {
    relationName: "receivedConversations",
  }),
  messages: many(message),
  blockedByList: many(blockedAccounts, { relationName: "blocked_user" }),
  blockingList: many(blockedAccounts, { relationName: "blocking_user" }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  teams: many(team),
  members: many(member),
  invitations: many(invitation),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  teamMembers: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

///

export const conversation = pgTable(
  "conversation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("conversation_participants_idx").on(table.senderId, table.receiverId),
  ],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("message_conversationId_idx").on(table.conversationId)],
);

export const blockedAccounts = pgTable("blocked_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockedBy: uuid("blocked_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  blocked: uuid("blocked_account")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const blockedAccountsRelations = relations(
  blockedAccounts,
  ({ one }) => ({
    blocker: one(user, {
      fields: [blockedAccounts.blockedBy],
      references: [user.id],
      relationName: "blocking_user",
    }),
    blockedUser: one(user, {
      fields: [blockedAccounts.blocked],
      references: [user.id],
      relationName: "blocked_user",
    }),
  }),
);

export const conversationRelations = relations(
  conversation,
  ({ one, many }) => ({
    sender: one(user, {
      fields: [conversation.senderId],
      references: [user.id],
      relationName: "initiatedConversations",
    }),
    receiver: one(user, {
      fields: [conversation.receiverId],
      references: [user.id],
      relationName: "receivedConversations",
    }),
    messages: many(message),
  }),
);

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  author: one(user, {
    fields: [message.authorId],
    references: [user.id],
  }),
}));

//-----------> Upper code is generated by BetterAuth command <-----------//

export const userInsertSchema = createInsertSchema(user);
export type UserInsertType = z.infer<typeof userInsertSchema>;

export const sessionInsertSchema = createInsertSchema(session);
export type SessionInsertType = z.infer<typeof sessionInsertSchema>;

export const accountInsertSchema = createInsertSchema(account);
export type AccountInsertType = z.infer<typeof accountInsertSchema>;

export const verificationInsertSchema = createInsertSchema(verification);
export type VerificationInsertType = z.infer<typeof verificationInsertSchema>;

export const organizationInsertSchema = createInsertSchema(organization);
export type OrganizationInsertType = z.infer<typeof organizationInsertSchema>;

export const teamInsertSchema = createInsertSchema(team);
export type TeamInsertType = z.infer<typeof teamInsertSchema>;

export const teamMemberInsertSchema = createInsertSchema(teamMember);
export type TeamMemberInsertType = z.infer<typeof teamMemberInsertSchema>;

export const memberInsertSchema = createInsertSchema(member);
export type MemberInsertType = z.infer<typeof memberInsertSchema>;

export const invitationInsertSchema = createInsertSchema(invitation);
export type InvitationInsertType = z.infer<typeof invitationInsertSchema>;

// BetterAuth Tables UPDATE Types and Schema Genreation using drizzle-zod

export const userUpdateSchema = createUpdateSchema(user);
export type UserUpdateType = z.infer<typeof userUpdateSchema>;

export const sessionUpdateSchema = createUpdateSchema(session);
export type SessionUpdateType = z.infer<typeof sessionUpdateSchema>;

export const accountUpdateSchema = createUpdateSchema(account);
export type AccountUpdateType = z.infer<typeof accountUpdateSchema>;

export const verificationUpdateSchema = createUpdateSchema(verification);
export type VerificationUpdateType = z.infer<typeof verificationUpdateSchema>;

export const invitationUpdateSchema = createUpdateSchema(invitation);
export type InvitationUpdateType = z.infer<typeof invitationUpdateSchema>;

// BetterAuth Tables SELECT Types and Schema Genreation using drizzle-zod

export const userSelectSchema = createSelectSchema(user);
export type UserSelectType = z.infer<typeof userSelectSchema>;

export const messageSelectSchema = createSelectSchema(message);
export type MessageSelectType = z.infer<typeof messageSelectSchema>;

export const messageInsertSchema = createInsertSchema(message);
export type MessageInsertType = z.infer<typeof messageInsertSchema>;

export const conversationSelectSchema = createSelectSchema(conversation);
export type ConversationSelectType = z.infer<typeof conversationSelectSchema>;

export const blockedAccountSelectSchema = createSelectSchema(blockedAccounts);
export type BlockedAccountSelectType = z.infer<typeof blockedAccountSelectSchema>;

export const schema = {
  //tables
  user,
  session,
  account,
  verification,
  organization,
  team,
  teamMember,
  member,
  invitation,
  conversation,
  message,
  blockedAccounts, 
  //relations
  userRelations,
  sessionRelations,
  accountRelations,
  organizationRelations,
  memberRelations,
  invitationRelations,
  teamMemberRelations,
  teamRelations,
  messageRelations,
  conversationRelations,
  blockedAccountsRelations, 
};
