<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Other students' profiles are read only via the student_directory() database function; the profiles table SELECT policy is own-row only. Why: hides account identifiers while keeping matching working.
- Roadmap evidence is stored separately from legacy planning notes; database triggers validate evidence and review transitions and derive completion from approved submissions. Why: direct database calls cannot bypass milestone approval.
