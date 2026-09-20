# Rabiul Work Hub Next — Canonical Product Brief

This folder is the single canonical build for the next Rabiul Work Hub. Do not patch older Vercel snapshots or duplicate repositories.

## Product purpose
A modern, fully responsive teaching/admin workspace for Rabiul at Oldham College. It should reduce repetitive teaching/admin work, keep curriculum/specification context together, and make it easy to use ChatGPT via the no-API **Ask Intelligence** workflow.

## Exact course names
1. Digital Skills for Work Level 3
2. T Level Digital Software Development Year 1

Never show internal legacy course keys to the user.

## Required top-level areas
- Dashboard / Today
- Curriculum
- Specifications & Coverage
- Lesson Studio
- Ask Intelligence
- Employer Set Project
- Assessment Planner
- Mark Work
- Assignment Briefs
- Learners
- Attendance & Interventions
- One-to-Ones
- Progression & Transfers
- Weekly Planner
- Timetable
- Rooms & Equipment
- Employer Engagement
- Resources
- Emails & Logs
- Settings / backup / diagnostics

## Ask Intelligence
- Feature name must be **Ask Intelligence**.
- No consumer AI brand in the Hub UI.
- No API key required.
- No separate API billing.
- Prepare the relevant Hub context, copy it, and open the user's existing ChatGPT workspace.
- Use course, specification coverage, teaching style, recent lesson/marking/planner context when relevant.
- Keep manual prepared-context preview and copy fallback.

## Lesson Studio
Use the uploaded Oldham College lesson-template feel:
- cream/off-white slide canvas
- orange accent
- Calibri/Arial style
- restrained professional layout
- Faculty of Digital & Creative
- classroom expectations early where appropriate
- Do Now/retrieval
- clear learning objectives
- one concept per slide where possible
- normally 2 teaching slides followed by a task
- realistic college/workplace/app/business scenarios
- pairs, individual work and groups of 3 where appropriate
- clear expected output
- scaffolding and genuine stretch
- theory-only means no code/practical work when requested
- model/worked answer before independent assessment where useful
- finish with five recap questions plus extension/exit ticket
- 3–3.5 hour lessons are common
- around 20 slides is common
- prompt area before generation and improvement prompt after generation
- natural wording; avoid obvious AI phrasing and walls of text

## Marking
Default feedback structure:
- WWW
- EBI
- Overall
- Indicative Grade

Feedback must be specific, concise, ready to paste, and identify exact missing evidence such as screenshots, outputs, UML, flowcharts, pseudocode, testing evidence, explanations, SPaG or criterion mapping.

## Assignment briefs
- professional but brief
- student-facing
- cover all required criteria
- clear task and evidence requirements
- Oldham College style where exported
- avoid bloated AI-like wording

## Curriculum/specification rules
Digital Skills for Work Level 3 currently includes the uploaded Gateway Software Development extract with 7 official units:
- Project Management
- JavaScript
- Maths for Computing
- Object Oriented Programming
- Programming Implementation
- Robot Technology
- Software Testing

Do not falsely label other delivery-plan areas as official awarding-body criteria unless the source supports that claim.

T Level Digital Software Development Year 1:
- 8 Core content areas
- Core Paper 1
- Core Paper 2
- Employer Set Project
- 8 Occupational Specialism areas
Use the uploaded official specification structure as the source of truth.

## UX requirements
- modern, polished app rather than prototype dashboard
- fully responsive on Android phone, tablet and desktop
- touch-friendly controls
- safe-area support on mobile
- mobile bottom navigation must include Ask Intelligence
- slide-out sidebar on mobile
- strong hierarchy, clean spacing, minimal clutter
- tables horizontally scroll safely on phone
- Lesson Studio adapts cleanly across screen sizes
- no raw HTML or brittle hosting assumptions
- static-first architecture where possible for reliability
- local persistence with backup/export
- clear empty states
- no unrelated personal data in the Hub

## User wording/style preferences
- concise
- natural
- professional
- direct
- practical
- avoid "too AI"
- avoid unnecessary text
- ready to use
- do not ask repeated clarification when the intent is clear

## Deployment rule
This folder is the canonical source:
`bombersaurus/bombersaurus/rabiul-work-hub-next`

Deploy it as a new Vercel project with this folder as the project root. Do not modify or depend on the older `rabiulhasan3499-ui/rabiul-work-hub` snapshot.

## Final QA checklist
- JavaScript syntax passes
- no missing referenced files
- all navigation destinations render
- mobile nav works
- Ask Intelligence works without API
- no `/api/chat` dependency
- lesson generation and improvement work
- marking/brief/learner/planner flows work
- localStorage migration/backups do not crash
- exact visible course names are correct
- responsive layouts at 360px, 768px, 1024px and desktop
- no broken deployment root paths
