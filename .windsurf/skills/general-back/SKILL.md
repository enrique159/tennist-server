---
name: general-back
description: General backend skill for a NestJS project based on TypeORM and MySQL created with domain-driven design principles.
---

## Project Overview

Tennist is a mobile application designed as a **tennis ecosystem hub**, combining sports tracking, social interaction, and sports infrastructure management.

The backend is built using **NestJS**, **TypeORM**, and **MySQL**, and must follow **domain-driven design**, modular architecture, and long-term scalability principles.

This document defines the **global system context** that Windsurf must always consider when generating, modifying, or reasoning about backend code.

---

## System Purpose

The backend exists to:

- Manage users and authentication
- Support **accumulative roles** (player, coach, club owner)
- Store and process tennis-related data (matches, stats, practices)
- Enable social interaction between players
- Manage tennis infrastructure (venues, courts, tournaments, classes)
- Scale towards reservations and payments without major refactors

This backend is **not a simple CRUD API**.  
It represents a **real-world tennis domain** with rules, constraints, and relationships.

---

## User Roles Model

Roles are **additive**, not exclusive.  
A user may hold multiple roles at the same time.

### Player (Base Role)
Every user is at least a Player.

Capabilities:
- Register matches and practices
- View personal statistics
- Discover courts, clubs, tournaments, and classes
- Add friends and interact socially
- Invite other players to matches

---

### Coach
Extends Player capabilities.

Additional capabilities:
- Create and manage classes or courses
- Manage schedules and attendance
- Enroll players into classes
- Track player progress and performance
- Access student statistics

---

### Club Owner
Extends Coach and Player capabilities.

Additional capabilities:
- Create and manage clubs (venues)
- Create and manage courts
- Define court schedules and pricing rules
- Manage memberships
- Create and manage tournaments
- Promote events within the application

---

### Admin
Internal system role.

Capabilities:
- Manage users
- Create public venues and courts
- Moderate content
- Supervise platform health

Admins are **not part of the tennis business domain** and should not be modeled as domain entities.

---

## Backend Domains

The backend is divided into **clear, independent domains**:

### 1. User Domain
- Users
- Roles
- Authentication & authorization

### 2. Sports Domain
- Matches
- Statistics
- Practices
- Tournaments
- Results

### 3. Social Domain
- Friends
- Invitations
- Posts
- Notifications

### 4. Infrastructure Domain
- Venues (physical locations)
- Courts
- Court schedules
- Court availability
- Court pricing rules
- Reservations (future)

### 5. Coaching Domain
- Coaches
- Classes
- Courses
- Enrollments
- Player tracking

---

## Core Domain Rules

### Venue as the Physical Root
All courts **must belong to a Venue**.

A Venue represents a real-world physical location such as:
- A private tennis club
- A public park
- A sports complex

Courts **must never exist without a Venue**.

---

### Courts Are Physical Assets
A Court represents:
- A single, physical tennis court
- With surface type and physical characteristics

Courts must **not** directly contain:
- Schedules
- Pricing
- Availability
- Reservations

These concerns are modeled as separate entities.

---

### Separation of Concerns

- CourtSchedule defines recurring weekly availability
- CourtAvailability defines exceptions (maintenance, events, tournaments)
- CourtPricingRule defines pricing logic
- Reservation defines actual usage (future)

Each entity has **one responsibility only**.

---

### Business Logic Location
Entities store **state**, not complex logic.

All business rules must live in:
- Domain services
- Application services
- Guards and policies

---

### Progressive Scalability
The system must allow:
- Starting without payments
- Adding reservations later
- Introducing memberships
- Supporting tournaments and classes

Without breaking existing data models.

---

## Technical Conventions

- NestJS modular architecture
- TypeORM entities with explicit relations
- Prices handled in **integer cents**
- Permissions validated in guards and services
- Cascading deletes only when safe
- Avoid tightly coupled entities

---

## Project Philosophy

This backend is the foundation of a **sports and social platform**, not just an API.

All generated code should prioritize:
- Domain clarity
- Maintainability
- Scalability
- Real-world correctness

---

## Authority Rule

If any generated code or suggestion conflicts with this document,  
**this document takes precedence** until it is explicitly updated.