# §15.10 — State Government Incapacity (PENDING — not yet incorporated)

**Status: INCORPORATED 260822.** §15.10 is live in constitution_data.json, annotated.html, and
the changelog. The final text landed simpler than the design iteration below — John pulled back
from actor-level specificity (who confirms, what timeline, who administers) to a stated-principle
version, judging that outcome-limiting language (scope + automatic termination) was itself the
safeguard and didn't need actor-level detail layered on top. This file is kept as the design
history — the reasoning behind the rejected specificity is still useful context for interpreting
what the principle-level text is meant to accomplish, even though most of it isn't in the
constitutional text itself.

**Final text:**

> Where a State's constitutional government has become incapable of exercising governmental
> authority and cannot be restored through its own constitutional continuity mechanisms, the
> Republic may temporarily administer only those functions necessary to preserve rights,
> essential services, and restoration of democratic State government. The State's constitutional
> identity and status remain unaffected. Temporary administration ends automatically when
> constitutional State government is restored. Procedures are established by statute.

---

## THE PROBLEM THIS SOLVES

Nothing in the current document handles a state's governing institutions collapsing
simultaneously and completely — governor, lieutenant governor, chamber leaders all lost, both
chambers below quorum, courts unable to sit, election infrastructure destroyed.

**§15.3 (Mandatory Devolution) is the closest existing mechanism, and it doesn't cover this.**
Verified directly against its text: §15.3 assumes a functioning state legislature throughout —
it explicitly states the state legislature "retains full legislative authority over all
remediation decisions." That's a multi-year, slow-motion standards decline (three consecutive
failed annual audits), not sudden total institutional loss. A state facing what this provision
is for has no legislature left to retain anything.

Without something here, the honest answer to "what happens if a disaster kills a state's entire
government at once" is nothing. No mechanism, no default — a genuine vacuum, in a document
whose whole design philosophy has otherwise been to define a failure state for every provision.

**Why it's constitutional and not just left to statute:** if "incapacity" were statute-defined,
an ordinary legislative majority could quietly redefine it downward — from "government ceased
to exist" to something looser like "persistent gridlock" — and use the mechanism to seize a
state it dislikes politically. The objective trigger in (1) is the entire safeguard; it only
works if it can't be loosened by ordinary statute.

**How this differs from martial law / §1.19 emergency declarations:** those answer "what can a
still-functioning government do to restrict rights during a crisis." This answers "what happens
when there is no government left to declare anything, martial law or otherwise." §15.10 is what
exists underneath martial law, for when the thing that would declare it has itself become a
casualty.

---

## ORIGIN

Surfaced while discussing the Aldenmere state constitution's own succession architecture. John's
framing: a state constitution should only need to survive *reasonable* failures (quorum loss,
disaster response, budget continuation). Total institutional catastrophe is "precisely where the
Federated Republic should matter" — a federation is partly a resilience mechanism, and this
provision makes that idea operational rather than an unstated assumption.

A pasted analysis document (from a separate conversation, shared as input) proposed a fuller
version with several safeguards. Not all of it survived to the current draft, but three of its
insights did real work:
- **Distinguish "assistance while still functioning" from "stewardship because government ceased
  to function."** Different situations, shouldn't be the same mechanism. (This distinction is
  now handled by (2)'s existing petition route staying separate from (1)'s incapacity trigger.)
- **"State suspension," not reclassification to Territory status.** Avoids a cascade of ugly
  questions — does it lose Senate seats, does its state constitution cease to exist, does it need
  a new Statehood Audit afterward. The state's legal identity should persist unchanged throughout.
  This is (5) in the current draft, essentially unchanged from the original proposal.
- **Restoration must be automatic on objective conditions, not federal discretion over
  "readiness."** Survives in (6): the state's own confirmation ends the emergency, with "no
  federal act... permitted" to end it — meaning the federal government can't hold on past that
  point, not just that it isn't required to act.

The pasted document's SC-confirms-the-trigger idea and its 30-day-window instinct did NOT
survive — see the design iteration below for why.

---

## DESIGN ITERATION — every correction and why it happened

**1. SC confirmation → rejected.**
Original idea (mine, drawing on the pasted document): SC confirms the JMC's incapacity finding
before anything activates. John's correction: the SC needs to stay out of the trigger entirely,
because it may have to hear an actual case arising from how this plays out — a wrongful finding,
an administration that overstepped its mandate. If the SC already blessed the initial finding,
it can't later serve as a neutral body reviewing whether things went right. Fixed by routing
disputes through §4.5(5)'s existing "State v. federal government" original jurisdiction instead
of building a bespoke SC role into the trigger.

**2. Who confirms — whole national legislature → the state's own delegation.**
First draft: absolute majority of both full national chambers. John's correction: he meant the
*incapacitated state's own* delegation to both chambers — because they represent that state's
people specifically, would be physically at the national capital (surviving a local disaster
that killed the state's own local government), and are the ones politically accountable for the
decision at their own state's ballot box. This is a better bad-faith safeguard than the original
too — other states' representatives can't gang up on one they dislike, since only that state's
own people can trigger it.

**Flagged, not yet resolved as a problem:** Senate is fixed at 2 per state; Assembly apportionment
guarantees only a minimum of 1 seat. A state's entire delegation could be as few as 3 people,
meaning a "majority" could be 2 individuals. John's fallback design (next point) effectively
self-corrects this rather than requiring a separate fix.

**3. Timing — added a 14-day clock, then refined to 48 hours, then scratched a renewable
extension.**
John: the delegation should be able to act fast — 14 days at first, later refined down to 48
hours specifically because "the representatives will already be pushing," meaning they don't
need time to mobilize, just to vote. If the delegation doesn't or can't confirm, it falls to the
full Senate (equal-weight body, better fit for a question about another state's standing than
the population-weighted Assembly) with a 14-day outer bound running from the *same* publication
event — not a fresh 14 days stacked on top, keeping the total window at 14 days rather than
stretching toward 2.5 weeks.

John briefly proposed the Senate could extend in 30-day increments after the initial 14, then
reconsidered and scratched it: a body that periodically has to vote to keep an emergency running
recreates the exact "federal discretion over when the state is ready" problem this design is
built to avoid. Replaced entirely by condition-based restoration in (6) — nobody decides the
state is ready; the state's own restored government says so.

**4. JMC's role — publish only, no operative effect, stated explicitly.**
John: the JMC finds and publishes; it cannot have an action beyond that. This is now written
directly into (2) — "The JMC's finding has no operative effect beyond publication" — rather than
left to be inferred from §9.1's general Monitor-independence language, so a future reader (or a
future John) doesn't have to reconstruct why the JMC can't act unilaterally.

**5. Who administers — unnamed → the Civic Consul.**
Caught a real gap, not a preference: subsection (4) described what temporary administration was
*limited to* but never named who actually carries it out. The CC holds residual executive
authority — everything not specifically assigned elsewhere — which is exactly this category.
Every other executive function in the document routes through the CC or LC; leaving this
unassigned would have been the actual anomaly.

**6. Domestic terrorism scenario — the real question, and where I initially got it wrong.**
John's scenario: an emergency requiring immediate action, with the CC heading an "Emergency
Panel" made of the state's own delegation as a pseudo-governing body, ending when the state's
own government is reconstituted.

My first response treated this as a *sequencing* problem — should the CC be able to act before
confirmation, given the speed an emergency requires — and proposed the CC could act immediately
with confirmation running concurrently afterward, mirroring §14.4's immediate-defensive-trigger
pattern (act now, lapse automatically if not confirmed).

**John's actual point, once stated plainly, dissolved the whole framing:** "Immediate CC action
is bound in their executive power. That is really not the question. It's when does that end and
pseudo state governance begin." The CC responding to an emergency — coordinating disaster
response, deploying resources — is already ordinary executive function under residual authority.
It was never gated by anything in this draft, and never needed to be; §15.10 only governs the
later, narrower moment when an emergency response stops being *assistance* and becomes *actually
standing in for a government that no longer exists*. My proposed fix was solving a problem that
didn't exist, created by conflating two different questions the provision was never meant to
answer at once.

**Resolution:** stated the boundary explicitly in (1) rather than leaving it to be inferred —
"Nothing in this section limits the Civic Consul's authority to respond to an emergency within a
State through ordinary executive means; this section governs only the transition to temporary
administration of the State's governing functions." The Emergency Panel structure survived
intact and moved into (4) as the *governing shape once activated*, fully separated from the
*timing* question that had been the source of the confusion.

**Also settled in this exchange:** the state can already request temporary administration under
existing (2) at any time, independent of the incapacity trigger — this was never blocked by
anything drafted, so "the state needs a fast way to ask for help" was solved before the
domestic-terrorism scenario even came up.

---

## CURRENT DRAFT (as of 260822 — not incorporated)

**§15.10 — State Government Incapacity**

> (1) Where a State's government cannot constitute an executive authority, a legislative quorum,
> or a functioning judiciary, and no succession or continuity mechanism under the State's own
> constitution can restore them, the State's government is constitutionally incapacitated.
> Nothing in this section limits the Civic Consul's authority to respond to an emergency within a
> State through ordinary executive means; this section governs only the transition to temporary
> administration of the State's governing functions.
>
> (2) A surviving State authority may petition the federal government for temporary
> administration; where no State authority capable of petitioning exists, the JMC may make the
> finding of incapacity directly and publish it to the NRS with its factual basis. The JMC's
> finding has no operative effect beyond publication.
>
> (3) Within 48 hours of publication under subsection (2), temporary administration activates
> upon confirmation by absolute majority of the incapacitated State's own delegation to both
> chambers, voting together as a single body. Where no confirmation occurs within that period,
> temporary administration instead activates upon confirmation, within 14 days of publication, by
> absolute majority of the full seated Senate.
>
> (4) Temporary administration is headed by the Civic Consul, who convenes an Emergency Panel
> comprising the incapacitated State's own delegation to both chambers. Temporary administration
> is limited to maintaining essential public services, protecting rights, preserving State
> records and property, and restoring the State's constitutional government; it may not alter
> State law, the State's own constitution, or dispose of State property.
>
> (5) The State retains its status as a State throughout — its Senate representation, State
> constitution, and constitutional identity are unaffected.
>
> (6) Temporary administration ends automatically upon the State's restored government publishing
> to the NRS a confirmation of its own functionality. No federal act is required or permitted to
> end temporary administration.

---

## OPEN / UNRESOLVED WHEN THIS WAS PARKED

- **Small-delegation vulnerability (point 2 above)** — flagged, not separately resolved. The
  Senate fallback in (3) may be sufficient mitigation on its own; worth a deliberate yes/no
  rather than leaving it merely noticed.
- **Senators + Assembly members voting together as one pool vs. separately by chamber** — drafted
  as "together as a single body" per John's original framing ("the state's entire representation"
  as one group), but never explicitly re-confirmed after the delegation-size concern surfaced.
  Voting separately (majority of the state's senators AND separately a majority of its Assembly
  members) would be a slightly more robust safeguard against a large Assembly delegation
  outvoting both senators alone — worth a deliberate choice rather than defaulting to the
  original phrasing.
- **General "is this necessary" question** — answered via the Institution Test (nothing else
  covers this scenario) but worth John's own gut-check once he's had time away from the drafting
  session.

## NEXT STEPS WHEN JOHN RETURNS TO THIS

1. Confirm or revise the two open points above.
2. If confirmed as final: incorporate into constitution_data.json as new §15.10 (Article XV
   currently ends at §15.9), sync, update annotated.html, add changelog entry, verify no
   cross-reference or consistency issues, check whether any Quick Sheet or scenario touches
   Article XV's scope and needs updating.
3. Consider whether this belongs in the "recently added machinery, never yet shown in world
   content" list — same category as the Territory Convention was before the Korda arc gave it a
   story. Not urgent; note for later.
