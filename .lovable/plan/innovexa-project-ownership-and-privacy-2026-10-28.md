# Innovexa project ownership and privacy

## Preserve
Keep the existing design, accounts, projects, profile directory, matching, invitations and evidence-based roadmap. Do not upgrade dependencies or rebuild the application.

## Ownership
- Preserve existing profile-based ownership and add an immutable authenticated creator ID, backfilled from each owner's account. Existing sample projects remain labelled samples, without invented account IDs.
- Restrict project changes and deletion to the owner in database rules and every existing mutation control. Display errors instead of navigating as though denied operations succeeded.
- Keep approved teammates' existing roadmap submission permissions; approval and project changes remain owner-only.

## Privacy
- Add Public Discovery, Approval Required and Private Team to creation and owner settings, with Approval Required selected for new projects.
- Preserve existing projects' current discoverability and content; initially classify them as Public Discovery rather than silently hiding or deleting their existing information.
- Provide public discovery through the existing Projects URL, using the same cards and layout. Visitors can browse safe summaries; sign-in remains required for joining and private access.
- Public Discovery shows general problem and solution, skills and available positions. Approval Required omits solutions and private details. Private Team projects are excluded from discovery and accessible only to owners and approved members.
- Keep confidential solution details, implementation notes, document links and confidential notes behind separate database-protected reads. Restricted fields must not appear in list responses, search, page metadata or denied direct requests.
- Treat existing problem statements as the general discovery summary. Owners can edit the general summary separately from confidential content.

## Joining
- Reuse the existing invitation/team membership flow and add owner-reviewed incoming join requests.
- Pending requests grant no private access. Only owners accept or reject; approval grants membership. Prevent duplicate requests and invitation-field changes that could forge membership in another project.
- Existing accepted invitations continue to authorize team access. Private team invitations still work without exposing private content before acceptance.

## Technical approach
- Use additive Lovable Cloud migrations, explicit grants, RLS and validation triggers; preserve all old ownership references.
- Restrict direct project-table reads to the owner and authorized team. Supply discovery through a narrowly projected database function that omits private projects and confidential fields.
- Update every existing project read surface, including dashboard, growth, search, invitations and detail pages, to use the appropriate safe or authorized read path.
- Keep public routes free of authentication redirects; retain the managed authenticated layout for account-only pages.
- Add focused ownership, privacy and request-transition tests next to existing tests.

## Verification and limitations
- Test owner creation, updates, deletion and refresh persistence; test a second account's permitted summaries, denied mutations, join request, approval and private access.
- Test direct database requests, private URLs, privacy changes and attempts to approve someone else's request or change invitation identity.
- Use your own account first. Testing as another existing student requires your choice and permission; do not create fake accounts.
- Report checks that remain unverified. Access controls limit unauthorized access but cannot prevent approved members from copying or sharing information, or retract content already disclosed publicly. Document links also require appropriate sharing permissions from their host.