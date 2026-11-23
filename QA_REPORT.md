# Nihongo Studio — Quality assurance summary

**Build:** English-language interface, separated Phase E / Phase F navigation.

## Content integrity
- Phase E: 4 practice sessions, 40 questions; exact question/choice/key/explanation strings retained from the prior Fase E release.
- Phase F: 22 practice sessions, 220 questions; exact question/choice/key/explanation objects retained from the prior Phase F release.
- Indonesian text remains in Japanese lesson translations and quiz content.

## Browser checks
- Responsive checks at 320, 390, and 1280 px on 10 representative pages: no horizontal overflow and no JavaScript page errors.
- Completed a 10-question session in Phase E and Phase F, verified answer selection, feedback, next question, and scoring.
- Header spacing specifically reviewed at 320 px.
- JavaScript syntax verified for all included scripts.

## Limitations — require owner review before production
- Tests used local static HTML injected into Chromium, not the public hosting URL. Retest actual live links, redirects, domain, HTTPS, and audio on target devices after deployment.
- Audio is browser/OS text-to-speech. Device-dependent pronunciation is not equivalent to independently reviewed studio recordings.
- No built-in offline PWA mode, user accounts, centralized learning analytics, payment integration, or purchase controls.
- Professional Japanese copyediting, educational quality review, trademark/copyright checks, legal and privacy review, and commercial hosting suitability remain prelaunch responsibilities.
- GitHub Pages is not intended as free hosting for an online business, e-commerce website, or commercial SaaS. Use suitable infrastructure for a commercial service.
