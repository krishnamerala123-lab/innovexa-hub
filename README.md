# Innovexa Hub

Build a professional, responsive web application called INNOVEXA.

TAGLINE:

Discover. Connect. Learn. Build. Launch.

PROJECT PURPOSE:

Innovexa is a student innovation ecosystem that connects student

skills to real project requirements. Students can showcase their

abilities, discover projects, find complementary teammates, and

follow a roadmap to build working prototypes.

IMPORTANT:

Follow this concept closely. Do not turn Innovexa into a generic

social network, job portal, or AI chatbot.

DESIGN:

Create a polished startup-style interface suitable for a national

college hackathon demonstration.

Use:

- A professional landing page

- A modern student dashboard

- Clean typography and consistent colours

- Responsive layouts for mobile and desktop

- Attractive project cards and student profile cards

- Clear navigation and meaningful empty states

CORE FEATURE 1: STUDENT REGISTRATION AND PROFILES

Allow students to register, sign in, and create profiles containing:

- Name and short introduction

- Technical and non-technical skills

- Interests

- Availability

- Projects and portfolio links

- Collaboration preferences

Persist profiles in a database.

CORE FEATURE 2: PROJECT AND IDEA LISTINGS

Allow students to create projects with:

- Project title

- Problem statement

- Proposed solution

- Target users

- Required skills

- Project interests

- Expected availability

- Current development stage

Users must be able to browse and search project listings.

CORE FEATURE 3: SKILL-TO-PROJECT MATCHING

This is the main differentiating feature.

For each project, identify the skills it requires and compare them

with the skills listed in student profiles.

Use an explainable, rule-based matching score with these proposed

weights:

- Skills: 50%

- Interests: 25%

- Availability: 15%

- Portfolio evidence: 10%

Show the score alongside an explanation of why the student matches.

Clearly label these weights as proposed and configurable.

Do not claim that the scoring model has been validated.

Allow users to filter and sort suggested teammates.

CORE FEATURE 4: TEAM INVITATIONS

Allow project owners to:

- View matching student profiles

- Send invitations

- See pending and accepted invitations

- Track team members

CORE FEATURE 5: IDEA VALIDATION AND ROADMAP

Provide a guided checklist covering:

- Problem clarity

- Target users

- Customer feedback

- Existing alternatives

- Technical feasibility

- Business model

Display missing requirements and practical next actions.

Provide roadmap stages:

1. Define the problem

2. Validate the need with users

3. Find teammates with missing skills

4. Build a prototype

5. Test and improve

6. Prepare for launch

CORE FEATURE 6: STUDENT GROWTH

Allow students to showcase projects, discover learning resources,

and find opportunities to contribute to other teams.

TECHNICAL REQUIREMENTS:

- Build a functional web application, not just static mockups.

- Use React for the frontend.

- Use Supabase or Firebase for authentication and database storage.

- Choose the simplest reliable integration supported by the environment.

- Protect private user data and enforce appropriate database access.

- Implement working forms, search, filtering, invitations, and navigation.

- Include realistic sample data for the demo.

- Clearly distinguish sample users from actual registered users.

- Never fabricate real users, partnerships, survey results, or funding.

- Do not add AI or blockchain unless specifically required later.

PRIORITY ORDER:

1. Professional interface

2. Student registration and profiles

3. Project creation and listings

4. Working skill-based matching

5. Team invitations

6. Roadmap and validation checklist

Build in stages. Test each feature before proceeding.

Prioritise a small, reliable MVP over many incomplete features.

The final result should demonstrate this complete workflow:

A student creates a project →

Innovexa identifies required skills →

Suitable student profiles are ranked →

The project owner invites teammates →

The team follows a roadmap to build a prototype.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://innovexa-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97260a60-7793-45cb-b9cf-ed4770fc19b5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
