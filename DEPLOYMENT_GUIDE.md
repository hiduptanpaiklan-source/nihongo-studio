# Nihongo Studio — Deployment and review

## What changed
- Homepage presents only Phase E and Phase F.
- Phase F overview: `fase-f/index.html`; Phase E overview: `fase-e/index.html`.
- Phase F modules remain at the original root URLs to avoid breaking older links.
- UI, navigation, instructions, controls, and result messages are in English.
- Material translations and exercise questions/explanations remain in Indonesian.
- Existing 22 × 10 Phase F questions and 4 × 10 Phase E questions are retained.
- Progress and scores are saved **locally** in the browser (not across devices).

## Upload (GitHub Pages)
1. Make a backup of the existing repository.
2. Extract the ZIP. Upload its contents (not the ZIP file) into the repository root, including folders.
3. Commit the files to the `main` branch, with Pages publishing from `/(root)`.
4. Wait for GitHub's build/deployment job to complete. Test homepage, both phases, every lesson and quiz.
5. The existing custom domain can remain unchanged. The new Phase F path is `/fase-f/` and Phase E path is `/fase-e/`.

## Prelaunch review
- Japanese speech uses browser speech synthesis, not fixed studio recordings; verify pronunciation on Android, iOS, Chrome and Safari.
- Normal access requires an internet connection. This package does not implement PWA offline caching.
- No accounts, centralized scores, payments, backend, analytics or tracking are provided.
- Complete a final pedagogical and native Japanese-language editorial review before commercial publication.
- Confirm trademark rights, content rights, privacy/legal disclosures, accessibility and hosting suitability.
- GitHub Pages is not intended as free commercial SaaS/e-commerce hosting. Migrate the commercial service to appropriate infrastructure before selling access.
