import { pgTable, uuid, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  progress: numeric("progress").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ['To Do', 'In Progress', 'Testing', 'Completed'] }).default('To Do'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  noteId: uuid("notes_id").references(() => notes.id, { onDelete: "cascade" }), // Torniamo a notes_id
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ['To Do', 'In Progress', 'Completed'] }).default('To Do'),
  position: integer("position"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
});
