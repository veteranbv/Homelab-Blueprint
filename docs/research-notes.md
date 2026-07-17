# Research notes for the 2026 rebuild

Reviewed 2026-07-16. These notes make the evidence trail visible without
turning the guide into a link dump.

## Method

Official documentation, release notes, security guidance, and repository
metadata establish what a project supports and whether it is maintained.
Practitioner discussions are a second signal for recurring friction, useful
workflows, and household fit. Stars, screenshots, and one enthusiastic post do
not establish a default.

The review covered project homepages and active repositories in
`recommendations.toml`, recent discussions from homelab and self-hosting
communities, current videos, Hacker News, and public reference architectures.
The automated audit checks reachability, archive/disabled state, recent push
activity, and editorial review age. A person still adjudicates every choice.

## Representative practitioner evidence

These are examples of the conversations used to test the guide's framing, not
votes that mechanically determine a winner.

- [A recent Debian homelab discussion](https://www.reddit.com/r/HomeServer/comments/1uy8m5x/debian_homelab/)
  reinforces the value of a small conventional Linux starting point.
- [A current-projects discussion](https://www.reddit.com/r/homelab/comments/1uvh4e7/what_are_your_current_projects_whats_in_the/)
  shows the diversity of goals and argues against one universal stack.
- [A backup-focused lab build](https://www.reddit.com/r/homelab/comments/1u8irra/my_little_homelab_for_testing_backup_solutions/)
  reflects the continued value of restore and recovery practice as a lab goal.
- [A 2026 NAS operating-system discussion](https://www.reddit.com/r/selfhosted/comments/1ssq3tv/nas_os_in_2026/)
  repeatedly separates storage-appliance goals from experimentation-host goals.
- [A daily-use self-hosted applications discussion](https://www.reddit.com/r/selfhosted/comments/1ugb4eg/what_selfhosted_apps_do_you_actually_use_every_day/)
  emphasizes durable household workflows over novelty deployments.
- [A current Plex and Jellyfin tradeoff discussion](https://www.reddit.com/r/selfhosted/comments/1uivq7z/plex_lifetime_or_setup_jellyfin_with_reverse_proxy/)
  supports presenting sovereignty and client polish as different priorities.
- [A diagram-maintenance discussion](https://www.reddit.com/r/selfhosted/comments/1u9u27o/i_stopped_handdrawing_my_homelab_diagram_now_it/)
  reinforces keeping architecture visuals tied to reviewable source data.

Community sources can be noisy, promotional, or wrong. The guide uses them to
find questions and recurring operational costs, then checks consequential facts
against primary sources linked in each chapter.

## Retirement checks

The rebuild explicitly rechecked names and lifecycle status that had aged out
of the original guide. Examples include TrueNAS Community Edition replacing old
FreeNAS/CORE/SCALE greenfield wording, Grafana Alloy replacing Promtail, the
active NZBGet continuation, and Seerr's unified request-management path. The
chapter that makes each claim links the corresponding primary announcement or
repository.

Return to the [Homelab Blueprint](../README.md).
