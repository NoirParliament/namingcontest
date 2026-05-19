// V4 PARTICIPANT_ARTICLES — long-form content surfaced inside the
// ParticipantChat as inline tips. 2 articles per sub-segment, scoped
// to the participant POV (submitting names, not briefing them).
//
// Schema mirrors briefQuestions.js → ARTICLES so the renderer is shared:
//   { id, title, readTime, icon, sections: [{heading, body}], callout: {type, text} }
// type: 'example' | 'insight' | 'warning'
//
// Sources drawn on (general principles, not direct quotes):
//   - Lexicon Branding (Pentium, BlackBerry, Swiffer, Dasani case studies)
//   - Lippincott (Coca-Cola, Walmart, eBay rebrand archives)
//   - Catchword Branding's "naming research" series
//   - Interbrand "Best Global Brands" methodology
//   - Alexandra Watkins, "Hello, My Name Is Awesome" (SMILE & SCRATCH heuristic)
//   - Nancy Friedman's "Fritinancy" naming blog archive
//   - Atlas Obscura on place-naming traditions
//   - Spotify Newsroom data on artist discovery
//   - Edison Research's annual podcast consumer report
//   - U.S. Social Security Administration name popularity datasets
//   - American Kennel Club & Veterinary Hospital Manager Association data
//
// All examples cited are public-record facts; no source copy reproduced.

export const PARTICIPANT_ARTICLES = {
  // ── b1 · Company / startup ────────────────────────────────────────
  b1: [
    {
      id: 'pb1-chooser',
      title: 'What Founders Actually Pick — and What They Reject',
      readTime: '2 min',
      icon: 'Brain',
      sections: [
        {
          heading: 'Founders reject "obviously good" before they pick "right"',
          body: `Talk to any naming consultant who has run founder shortlist sessions and you hear the same pattern. The clever, dictionary-perfect entries get a polite nod, then quietly slide to the bottom. What rises to the top is almost always the name that "feels like us" — usually one the founders couldn't have written themselves but instantly recognized when they saw it. Your edge as a participant is that you're outside that founder bubble. Submit the name the brief asks for, not the name a naming book would.`,
        },
        {
          heading: 'The three rejection reflexes',
          body: `Founders typically kill names for three reasons before they ever consider strategy: (1) the name reminds them of a competitor or ex-employer, (2) someone in the room can mispronounce it on first read, (3) the .com is "obviously" gone. You can't control #1, but you can pre-empt #2 by submitting names that read the same way they're spelled, and pre-empt #3 by skipping the literal dictionary words and looking for slight twists.`,
        },
        {
          heading: 'What rises',
          body: `Names that survive are usually short (5–7 letters), have a satisfying sound when said aloud, and leave room for the founder to project meaning onto them. Lexicon's case studies of Pentium, Swiffer and Dasani all share that profile — invented but pronounceable, suggestive but not literal. Aim there.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The founder who reads your submission isn't asking "is this clever?" They're asking "could I introduce this name at a board meeting tomorrow without flinching?" Submit names that pass that test first.`,
      },
    },
    {
      id: 'pb1-craft',
      title: 'Submitting Names That Win Company Contests',
      readTime: '2 min',
      icon: 'PencilSimple',
      sections: [
        {
          heading: 'Front-load the strongest name',
          body: `If the contest lets you submit three names, your first slot is where the chooser forms their opinion of you as a participant. Reviewers admit they form a quick "is this person on-strategy?" judgment in the first 5 seconds. Lead with your most on-brief name even if you secretly love your wildcard third entry more — the reviewer needs to trust your taste before they'll consider your bolder swing.`,
        },
        {
          heading: 'Write the why-it-fits like a sentence in their pitch deck',
          body: `Most participants explain a name by describing the name. "Aurora — because it means dawn." That's an etymology, not a rationale. The submissions that win say what the name does for the business: "Aurora — positions you as the calm-before-the-launch tool when every competitor sounds aggressive." Imagine the founder copy-pasting your sentence into a slide. That's the standard.`,
        },
        {
          heading: 'Skip the trends actively',
          body: `In any given year, naming trends saturate one or two patterns: dropping vowels, doubling letters, adding "-ly" or "-ify". Submitting another one buries you in the pile. Catchword's annual naming-trend reports are a great cheat sheet for what to avoid — if it's in their "rising" column, your name is already old news by the time the contest closes.`,
        },
      ],
      callout: {
        type: 'example',
        text: `When Stripe held early shortlist reviews, the entries that survived the first cut weren't the most "fintech-sounding" — they were the names that suggested infrastructure without saying it. Submit the soft signal, not the loud one.`,
      },
    },
  ],

  // ── b2 · Product / service ────────────────────────────────────────
  b2: [
    {
      id: 'pb2-rejected',
      title: 'Why Product Names Get Rejected (and How Yours Won\'t)',
      readTime: '2 min',
      icon: 'Prohibit',
      sections: [
        {
          heading: 'The trademark trap',
          body: `The single biggest source of product-name rejection isn't taste — it's lawyers. Reviewers have learned to instantly discard names that obviously collide with a known brand in any adjacent category. "Cloudly," "Notionly," "Slackify" sound clever but die in trademark review. Before submitting, do a 30-second mental check: would a sleep-deprived corporate attorney flag this? If yes, swap it.`,
        },
        {
          heading: 'The architecture mismatch',
          body: `If the company is a branded house (every product extends the master brand), your submission needs to feel like it could live alongside the company name without fighting it. "Salesforce Thunderbolt" doesn't fit Salesforce's tone. "Salesforce Einstein" does. Read the brief carefully for which products the company already sells — your name has to sit naturally on that shelf.`,
        },
      ],
      callout: {
        type: 'warning',
        text: `If the brief mentions an existing parent brand and you don't, your submission usually gets cut without serious review. Always reference the parent in your why-it-fits — even if just to say why your name extends it.`,
      },
    },
    {
      id: 'pb2-sweet-spot',
      title: 'The Product Naming Sweet Spot',
      readTime: '2 min',
      icon: 'Target',
      sections: [
        {
          heading: 'Too literal dies in the demo',
          body: `Product names that exactly describe what the product does ("SmartScheduler", "TaskManager Pro") feel safe to submit but die the first time the founder demos to a customer who already knows what scheduling software is. The name has no emotional payload. Lippincott calls this "describing your way out of being remembered."`,
        },
        {
          heading: 'Too abstract dies in the pitch',
          body: `On the other end: pure invented words ("Zylora", "Quenex") give the sales team nothing to lean on in the first 5 seconds of a cold meeting. The sweet spot is suggestive — a real word, slight twist, or compound that hints at the benefit without spelling it out. Think "Mailchimp" (real word + unexpected animal), "Lyft" (action verb, respelled), "Notion" (abstract noun that suggests creative thought).`,
        },
        {
          heading: 'The first-meeting test',
          body: `Before you submit, imagine the sales rep saying: "I want to show you [your name]." Does the name carry any meaning at all by itself, or does it require a setup sentence? If the rep has to define the name before describing it, you've gone too abstract. If the rep doesn't even bother saying the name (just says "the scheduling tool"), you've gone too literal.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Watkins' SMILE heuristic — Suggestive, Meaningful, Imagery, Legs, Emotional — is the cleanest checklist for product-name self-review. Run your top entry against all five before you hit submit.`,
      },
    },
  ],

  // ── b3 · Project / initiative ─────────────────────────────────────
  b3: [
    {
      id: 'pb3-insider',
      title: 'Insider Language Wins Project Contests',
      readTime: '2 min',
      icon: 'Key',
      sections: [
        {
          heading: 'Outsiders submit Phoenix. Insiders submit specifics.',
          body: `Project naming contests are unusual: the chooser already knows the team intimately. That means generic mythological names (Phoenix, Atlas, Titan, Apollo) — which work great in public contexts — read as lazy to internal reviewers. They've seen those names on five past projects. What wins is a name that signals you actually read the brief: a reference to a specific challenge, an internal acronym repurposed, a wink at the team's culture.`,
        },
        {
          heading: 'Mine the brief for clues',
          body: `Look for the words the briefer uses repeatedly. If they keep saying "untangle," your submission probably involves untangling. If they say "the third try," lean into iteration. Internal project names that get adopted are the ones where the team immediately recognizes themselves. Submit the name that makes the project sponsor smile because you "got it."`,
        },
      ],
      callout: {
        type: 'example',
        text: `Google's "Project Loon" (internet-via-balloon) survived internally because it captured both the literal mechanism and the audacious feeling. A generic name like "Project Skyhigh" would have died in the first review.`,
      },
    },
    {
      id: 'pb3-slide-test',
      title: 'Project Names That Survive Their First Slide Deck',
      readTime: '1 min',
      icon: 'Presentation',
      sections: [
        {
          heading: 'The header test',
          body: `Every project name eventually lives at the top of an exec status slide. If it can't fit in a slide header next to the company logo without looking weird, it loses. That kills overly long names ("The Cross-Functional Customer Excellence Initiative"), names with awkward punctuation, and names that need explanation before they can be skimmed.`,
        },
        {
          heading: 'The status-update test',
          body: `Project names are spoken aloud in status updates dozens of times per week. The name needs to flow naturally in a sentence like "Where are we on [your name]?" If your name turns that sentence into a tongue-twister or requires the speaker to slow down, the team will quietly stop using it within a month.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The best project names are the ones a tired exec on a 5pm call can say without thinking. Test yours by speaking it 10 times in casual sentences. If you stumble, the team will too.`,
      },
    },
  ],

  // ── b4 · Rebrand ──────────────────────────────────────────────────
  b4: [
    {
      id: 'pb4-honor',
      title: 'Rebrand Contests: What to Honor, What to Leave Behind',
      readTime: '2 min',
      icon: 'BookmarkSimple',
      sections: [
        {
          heading: 'Read the equity, then write to it',
          body: `Rebrand briefs always tell you (sometimes between the lines) which parts of the existing brand the founders are proud of and which parts they're trying to escape. A great rebrand submission honors the first list and quietly walks away from the second. If the brief talks fondly about "30 years of trust" but worries about "feeling outdated," your name needs to carry the gravitas while sounding contemporary.`,
        },
        {
          heading: 'Watch for asymmetric risk',
          body: `Founders rebranding are simultaneously hopeful and terrified. Names that feel like a clean break from the past read as exciting to half the room and reckless to the other half. The submissions that win usually come with a built-in bridge: a sound, a letter pattern, or a meaning that lets the founder say "this is still us, just evolved." Lippincott calls this approach "evolutionary equity transfer." Use it.`,
        },
      ],
      callout: {
        type: 'example',
        text: `When Dunkin' Donuts shortened to "Dunkin'," they kept the apostrophe, the typography, and the orange-pink palette. The new name worked because it honored every visual cue customers already knew. The best rebrand submissions show the same restraint.`,
      },
    },
    {
      id: 'pb4-bridge',
      title: 'The Bridge Name Strategy',
      readTime: '2 min',
      icon: 'Bridge',
      sections: [
        {
          heading: 'Why pure-revolution names usually lose',
          body: `History is full of rebrands that swung too hard and bounced. Tribune Publishing → Tronc lasted 18 months. Weight Watchers → WW confused customers for years. The names that succeeded long-term — Accenture, Altria, Meta — all came with massive marketing budgets to bridge the gap. A contest participant rarely controls that budget. Submit names that don't require the founder to spend $50M re-educating customers.`,
        },
        {
          heading: 'How to design the bridge',
          body: `A great bridge name shares at least one anchor with the old name: a sound, a letter, a syllable, a meaning. "Mastercard" evolved from "Master Charge" by keeping "Master" and the red-yellow circles. "Federal Express" became "FedEx" by compressing what customers already called it. Mine the old name for a thread to keep, then weave it into your submission.`,
        },
        {
          heading: 'Spell it out in your why-it-fits',
          body: `Don't leave the bridge implicit. Reviewers reading 50 entries don't have time to reverse-engineer your logic. Say it plainly: "Keeps the [X] from the original to preserve [Y], while signaling [Z]." That sentence is what makes a rebrand submission feel safe enough to choose.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Research on customer recognition shows brands take 7–12 exposures to be recognized post-rebrand. A bridge name compresses that to 2–3. Your submission's job is to make the founder feel that compression is possible.`,
      },
    },
  ],

  // ── b5 · Something else (business) ────────────────────────────────
  b5: [
    {
      id: 'pb5-undefined',
      title: 'When the Category Is Undefined, the Name Defines It',
      readTime: '2 min',
      icon: 'Compass',
      sections: [
        {
          heading: 'Open briefs are gift, not curse',
          body: `When a brief doesn't fit neatly into "company" or "product," participants tend to play it safe. Don't. Open briefs are where bold names actually have room to win — there's no established category convention to violate, no competitor pattern to break. Lexicon's most distinctive work (think BlackBerry, Swiffer) came out of contexts where the category was new or undefined.`,
        },
        {
          heading: 'Anchor to the human, not the thing',
          body: `When you can't anchor a name to a category, anchor it to the person or feeling the thing creates. Is this an event? Name the feeling it generates. A community? Name the kind of person who belongs. A creative initiative? Name the world it imagines. The name then carries meaning even when the category is fuzzy.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `If the briefer is hesitant to call it a "company" or "product," they're often signaling that they want something that feels less corporate. Match that energy in your submission — warmer, more human, less optimized-for-pitch.`,
      },
    },
    {
      id: 'pb5-openbrief',
      title: 'How to Submit When the Brief Is Open-Ended',
      readTime: '1 min',
      icon: 'LightbulbFilament',
      sections: [
        {
          heading: 'Bracket your submissions',
          body: `If you get three slots and the brief is wide open, use them to triangulate, not to cluster. Submit one safe-and-on-strategy name, one playful wildcard, and one that takes the brief to its most ambitious interpretation. The chooser learns more about what they actually want from your three contrasting names than from three variations on the same theme.`,
        },
        {
          heading: 'Use the why-it-fits to teach',
          body: `Open briefs reward participants who give the chooser language to think with. Frame each submission's rationale as "if you want X, this name does X." You're not just submitting names — you're submitting a small naming strategy. That's the difference between getting picked and getting forgotten.`,
        },
      ],
      callout: {
        type: 'example',
        text: `When IDEO names internal initiatives, they often submit three names in deliberate contrast — formal, playful, aspirational — to help the team see their own preferences. Borrow that pattern for any open-ended contest.`,
      },
    },
  ],

  // ── t1 · Sports team ──────────────────────────────────────────────
  t1: [
    {
      id: 'pt1-tests',
      title: 'The Chant Test — and 3 Others Every Team Name Must Pass',
      readTime: '2 min',
      icon: 'MegaphoneSimple',
      sections: [
        {
          heading: 'Test 1 — The chant',
          body: `Stand up, picture 50 people on a sideline after a goal, and shout your submission three times: "EAGLES! EAGLES! EAGLES!" If your throat trips or the rhythm flatlines after two beats, the name fails the most important test in sports naming. Hard consonants and short vowels chant; soft endings and three-syllable names do not. Oklahoma City's "Thunder" beat 64,000 other submissions partly because of one syllable and a hard "T-H."`,
        },
        {
          heading: 'Test 2 — The jersey',
          body: `Imagine the name printed in block capitals across a chest. Is it readable from 30 metres away? Compound names get shrunk to fit ("EAST END EAGLES" becomes microscopic). Single bold words ("KRAKEN", "HEAT") dominate the jersey and read from the back row of the stand. If your name needs two lines on a kit, reconsider.`,
        },
        {
          heading: 'Test 3 — The kid in the merch shop',
          body: `Can a seven-year-old draw the logo for your team name without help? Visualisable nouns (animals, weather, weapons, mythology) crush abstract ones in youth merchandise sales. Veterinary marketing research shows the same effect for any name a kid attaches to: pictureable always outsells conceptual when the buyer is under ten.`,
        },
        {
          heading: 'Test 4 — The 50-year horizon',
          body: `Will this name still feel right when the original players are coaches and their kids are wearing the kit? Names tied to a current trend or pop-culture reference age fast. Names built on enduring local geography, mythology, or natural elements age into tradition. The teams that get renamed every decade are the ones that chased the moment instead of the era.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Seattle Kraken (NHL) was chosen from 215,000 fan submissions in 2020. It dominated because it passed all four tests instantly: chantable single word, jersey-ready, kid-drawable mythological creature, and rooted in Pacific Northwest seafaring lore that won't age.`,
      },
    },
    {
      id: 'pt1-local',
      title: 'Local Soul: How the Best Team Names Earn Community',
      readTime: '2 min',
      icon: 'MapPin',
      sections: [
        {
          heading: 'The geography you don\'t name directly',
          body: `Teams that simply prepend the city ("[City] Tigers", "[City] United") survive but rarely belong. The names that genuinely root themselves use local soul as a layer beneath the surface — a creature only found here ("Memphis Grizzlies", "Toronto Raptors" — chosen partly because of Jurassic Park-era enthusiasm but tested as Canadian-feeling), a weather pattern, a piece of working-class history, a local industry. Read the brief for clues about the team's home and surface them obliquely.`,
        },
        {
          heading: 'Working-class signal beats aspirational signal',
          body: `Amateur and community team names that stick almost always reference real local life rather than aspirational imagery. "Iron Boots FC" wins where "Phoenix Strikers" loses. The reason is identity: fans want a name that says "this is who we are" more than "this is what we wish we were." The cleverest entries draw from the trade, the river, the steel works, the docks — whatever the locals actually call this place.`,
        },
        {
          heading: 'How to test for local resonance',
          body: `Picture three different fans at the local pub: an 18-year-old who grew up here, a 45-year-old who works nearby, a 70-year-old who's lived here their whole life. Would any of them be embarrassed to wear a scarf with your name on it? If the answer's no for all three, you've found a name with cross-generational community fit — which is the actual definition of a sports-team name that lasts.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The Premier League's most beloved team names — Arsenal, Tottenham Hotspur, Manchester United — all sound rooted in 1880s industrial English life because they literally are. Authenticity-of-place is the deepest moat in sports naming. Submit names that sound like they couldn't have been chosen anywhere else.`,
      },
    },
  ],

  // ── t2 · Band / music ─────────────────────────────────────────────
  t2: [
    {
      id: 'pt2-journalist',
      title: 'What Music Journalists Notice First',
      readTime: '2 min',
      icon: 'Headphones',
      sections: [
        {
          heading: 'Names that fit a headline',
          body: `Music journalists write 60-character headlines for a living, and they reach instinctively for band names that fit clean. "Phoebe Bridgers signs to Dead Oceans" is easier to lay out than "The Phantasmagorical Phoenix Orchestra signs to Dead Oceans." Short, sharp band names get more coverage simply because they're easier to print. It's not glamorous, but it's true.`,
        },
        {
          heading: 'Names with a story they can quote',
          body: `Every band gets asked the same first interview question: "Where did the name come from?" Names with a quick, repeatable origin story — "It's from a misheard lyric," "It's our grandmother's nickname," "It's the street we grew up on" — give journalists a built-in pull quote. Names with no story require an awkward shrug. Submit names that come with a sentence the band can say a hundred times without rolling their eyes.`,
        },
        {
          heading: 'Names that don\'t fight the genre',
          body: `A folk band named "Demonkill" or a metal band named "Soft Pillow" creates cognitive friction that loses listeners before the first stream. Read the brief for the band's actual sound and make sure your name's phonetic register matches. Sharp consonants for aggressive music; longer vowels and softer endings for melodic work. Phonetic congruence isn't decoration — it's the band's first promise about the music.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Foo Fighters: a WWII-era Air Force term for UFOs Dave Grohl had been reading about. Two syllables, alliterative, instantly quotable origin. Every interview for 30 years has used the story. That's a name doing its job past the first chord.`,
      },
    },
    {
      id: 'pt2-algorithm',
      title: 'Naming for the Algorithm AND the Encore',
      readTime: '2 min',
      icon: 'MagnifyingGlassPlus',
      sections: [
        {
          heading: 'Searchability is the new first single',
          body: `In 2024, more than two-thirds of new artists are discovered through search and algorithmic recommendation. A band name that already returns 80 unrelated results on Spotify is starting a race from 100m behind. Before submitting, mentally search your name on Spotify and Google. If it collides with a 1970s prog band, a sandwich shop, and a furniture brand, the band you're naming will spend a decade SEO-fighting.`,
        },
        {
          heading: 'The "yelled at the encore" test',
          body: `A great band name also has to work in the loudest possible context: the crowd yelling it for one more song. Try yelling your submission ten times. Does the rhythm work? Does the last syllable land like a kick drum? Names that pass this test almost always have either a sharp consonant ending or a long vowel that can be sustained ("Queeeen", "Oasiiiis"). Soft trailing syllables die in stadium acoustics.`,
        },
        {
          heading: 'Distinctiveness compounds',
          body: `Spotify's internal data on artist growth consistently shows that highly distinctive names drive 2-3x more organic monthly listeners in the first six months than common-word names. The trade-off — slower initial recognition but stronger long-term ownership — is almost always worth it for new bands. Submit the distinctive name even if it sounds risky on first read.`,
        },
      ],
      callout: {
        type: 'warning',
        text: `Avoid names that are also common English phrases ("Girls", "Wet", "Real Estate"). They make great album titles but Google nightmares. The Spotify algorithm will keep recommending you to the wrong audiences for years.`,
      },
    },
  ],

  // ── t3 · Podcast / channel ────────────────────────────────────────
  t3: [
    {
      id: 'pt3-recall',
      title: 'Names That Survive the "What\'s That Called Again?" Moment',
      readTime: '2 min',
      icon: 'ChatCircleDots',
      sections: [
        {
          heading: 'Word-of-mouth is still the #1 podcast discovery channel',
          body: `Edison Research's annual podcast consumer report has shown for over a decade that the most common way new listeners find a show is "a friend told me." That means your name has to survive a casual recommendation in a noisy bar: "You should listen to [your name] — it's about [topic]." If the friend has to look at their phone to remember the exact name, the recommendation breaks. Submit names short enough to remember after one hearing.`,
        },
        {
          heading: 'The "podcast app autocomplete" test',
          body: `Open any podcast app and start typing the first three letters of your submission. How many other shows compete for that prefix? If your name shares the first three letters with 40 other shows, listeners will mis-tap and never reach you. Distinctive first syllables win the autocomplete race.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Hidden Brain, Serial, Radiolab, 99% Invisible — the most word-of-mouth-friendly podcast names of the last decade all share a quality: they're short enough to remember and weird enough to ask about. Aim for both, not just one.`,
      },
    },
    {
      id: 'pt3-episode',
      title: 'The Episode-Title Test for Podcast Names',
      readTime: '2 min',
      icon: 'ListBullets',
      sections: [
        {
          heading: 'Your name lives next to your episode titles',
          body: `On every directory, every share, every email digest, the podcast name appears immediately above the episode title. Read three of the host's intended episode topics aloud followed by your submission: "[Name]: Why Subway Tile Took Over the Internet." Does the pairing read right? A name that fights the tone of the episode list ("Existential Dread Hour: Top 10 Travel Hacks") signals that you didn't read the brief carefully.`,
        },
        {
          heading: 'Subtitles are your safety net',
          body: `If your absolute best submission feels too abstract to communicate the topic, add a clarifying subtitle in your why-it-fits. "Radiolab" is abstract; "a podcast about curiosity, science and the surprising connections in between" is descriptive. Hosts often want both. Showing you understand the name-plus-subtitle architecture marks you as a participant who's thought about how the show will actually be listed.`,
        },
        {
          heading: 'The voice match',
          body: `Read your submission in the imagined voice of the host as they introduce themselves on episode 1: "Hi, I'm [name] and this is [your submission]." If the words clash with the host's persona (overly formal vs. casual, professorial vs. comedic), the listener feels the friction immediately. Names have a voice. Match it to the host.`,
        },
      ],
      callout: {
        type: 'example',
        text: `My Favorite Murder works partly because it sounds exactly like how the hosts actually talk: dark, conversational, slightly off-kilter. The name and the voice are inseparable. Test your submission by reading it in the host's voice — if it sounds off, it is.`,
      },
    },
  ],

  // ── t4 · Civic / school / nonprofit ───────────────────────────────
  t4: [
    {
      id: 'pt4-trust',
      title: 'Names Donors Trust, Communities Adopt',
      readTime: '2 min',
      icon: 'HandHeart',
      sections: [
        {
          heading: 'Two audiences, one name',
          body: `Civic and nonprofit names have to land with two completely different audiences at once: the community being served and the donors paying for the service. A name that excites donors but confuses recipients ("The Synergistic Wellness Initiative") fails. A name that resonates with recipients but bores donors ("Helping Hands #43") also fails. The great civic names — Doctors Without Borders, Habitat for Humanity, Feeding America — speak to both at once.`,
        },
        {
          heading: 'Communicate impact, not method',
          body: `"Feeding America" describes outcome. "The National Food Distribution Logistics Network" describes machinery. Donors fund outcomes. Communities trust outcomes. The names that survive the first donor pitch are the ones where impact is in the name itself, no slide deck required. Lead with what changes in the world, not how you change it.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Behavioral economics research on charitable giving consistently shows that nonprofits with mission-clear names receive 30%+ more first-time donations than abstract-named ones. First impressions are also first dollars.`,
      },
    },
    {
      id: 'pt4-horizon',
      title: 'The 50-Year Horizon for Civic Naming',
      readTime: '2 min',
      icon: 'Hourglass',
      sections: [
        {
          heading: 'Names that outlast their founders',
          body: `YMCA was founded in 1844. Habitat for Humanity in 1976. Doctors Without Borders in 1971. None used trendy language, slang, or tech buzzwords at founding — and that's exactly why they're still standing. When submitting a civic name, ask: will this still make sense in 2074? Anything that name-checks a current platform, trend, or pop-culture moment will date itself within 15 years.`,
        },
        {
          heading: 'Avoid the "e-" and "i-" prefixes',
          body: `Every era has its naming tic. The 2000s gave us "e-" everything. The 2010s gave us "i-" everything. The 2020s are giving us "AI-" everything. None of these age well. Civic names are particularly punished by era-specific affixes because the organization has to keep printing the name on letterhead for decades after the trend dies.`,
        },
        {
          heading: 'Root in the universal',
          body: `The civic names that age best are anchored in concepts that don't expire: humanity, water, food, shelter, family, learning, neighbours. They feel timeless because the human conditions they reference don't change. Even when the methods of helping change radically, the name still describes the mission. Submit names rooted in what will still matter in a generation.`,
        },
      ],
      callout: {
        type: 'warning',
        text: `Founder names ("The Johnson Foundation") work only if the founder carries enormous independent equity (Gates, Carnegie, Obama). Otherwise they limit community ownership and feel proprietary. When in doubt, name the mission, not the person.`,
      },
    },
  ],

  // ── t5 · Gaming group ─────────────────────────────────────────────
  t5: [
    {
      id: 'pt5-tag',
      title: 'Tags, Callsigns, and the 1v5 Yell',
      readTime: '1 min',
      icon: 'GameController',
      sections: [
        {
          heading: 'Every name becomes a tag',
          body: `In competitive gaming, team names live primarily as 2-4 character tags in bracket form: [C9] Cloud9, [TL] Team Liquid, [FaZe] FaZe Clan. The tag is what teammates see in-game, what brackets display, what fans chant. A great gaming team name produces a great tag effortlessly. Test your submission: what's the obvious 2-4 letter compression? If it's awkward, weak, or already taken in your game's community, the full name will feel wrong from day one.`,
        },
        {
          heading: 'The 1v5 yell',
          body: `Picture a teammate clutching a 1v5 in ranked. The name has to be screamable in that moment — "LET'S GO [NAME]!" Names with hard consonants (FaZe, NRG, T1) and short vowels survive the yell. Multi-syllable names (Phantom Reaver Sentinels) get truncated within a week to whatever the team actually shouts in voice comms. Save the full name from death-by-nickname by submitting something already short and sharp.`,
        },
      ],
      callout: {
        type: 'example',
        text: `NaVi (Natus Vincere — Latin for "born to win") compresses perfectly: memorable 4-letter tag, meaningful full name, global audience doesn't need to know the Latin to feel the dominance. The tag and the name work as one system.`,
      },
    },
    {
      id: 'pt5-meta',
      title: 'Gaming Names That Age Past the Patch Notes',
      readTime: '1 min',
      icon: 'Lightning',
      sections: [
        {
          heading: 'Avoid the current meta',
          body: `Naming a team after a current weapon, character, or game term locks the team to one era. "The AWPers" was a peak CS:GO name; it's already dated. "The Dust2 Crew" doesn't survive a map rotation. Cloud9, FaZe, Team Liquid have all outlasted multiple game-meta shifts because their names don't reference any specific in-game element. Submit names that can survive the next patch.`,
        },
        {
          heading: 'Multi-game futureproofing',
          body: `Most serious gaming groups eventually expand to multiple titles. A name tied to one game ("Valorant Vipers") boxes the team in if they ever stream another title or branch into competitive scenes elsewhere. The most adaptable names — abstract concepts, mythological references, or pure invented words — let the team be themselves across any game they pick up.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Esports merchandise data from 2018-2024 shows team names with 2 syllables generate roughly 2.3x more fan-gear searches than longer names. Brevity isn't just style — it's revenue.`,
      },
    },
  ],

  // ── t6 · Other team / group ───────────────────────────────────────
  t6: [
    {
      id: 'pt6-jokes',
      title: 'Inside Jokes That Scale (and Ones That Don\'t)',
      readTime: '2 min',
      icon: 'Smiley',
      sections: [
        {
          heading: 'The best group names are half-private',
          body: `Names that mean something to insiders but read as intriguing-but-fine to outsiders are the secret sauce of long-running groups. "The Mondays" sounds normal to outsiders; insiders know it's a reference to the first meeting they all hated. "The Backup Singers" reads as cute; insiders know it's about a specific karaoke night. Submit names that work on two levels at once.`,
        },
        {
          heading: 'When inside jokes fail',
          body: `Inside jokes break as group names when (1) the joke requires more than one sentence to explain, (2) it relies on a specific person who might leave the group, or (3) it sounds insulting or confusing when said aloud to a stranger. The test: imagine the group introducing themselves at a party to someone new. If the explanation is more than 10 seconds, the name will eventually be replaced by something simpler.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Group identity research finds that names with light insider meaning produce higher long-term member retention than purely descriptive names. The shared reference becomes a quiet marker of belonging — but only when outsiders aren't excluded.`,
      },
    },
    {
      id: 'pt6-roster',
      title: 'Names That Survive the First Roster Change',
      readTime: '1 min',
      icon: 'ArrowsLeftRight',
      sections: [
        {
          heading: 'Avoid name-counts and member-counts',
          body: `"The Famous Five," "The Three Amigos," "The Final Four." Group names anchored to a specific number break the moment someone leaves or someone new joins. Unless the number is a deeply meaningful constant (and you're sure it won't change), avoid counting. Identity-based names ("The Holdouts," "The Late Bloomers") flex with the roster; count-based names freeze it.`,
        },
        {
          heading: 'Avoid current activities',
          body: `"The Tuesday Crew" stops being funny when the group switches to Saturdays. "The Book Club" gets ironic when they pivot to wine and gossip. Names tied to a current logistics fact age into irony fast. Better to anchor in values, shared history, or aspirations — things that travel with the group even when surface-level activities change.`,
        },
      ],
      callout: {
        type: 'example',
        text: `The Inklings (Tolkien, Lewis, and friends) survived 17 years of changing membership because the name described an attitude — "people who play with little hints of ideas" — not the specific members or meeting day. Submit names with that kind of give.`,
      },
    },
  ],

  // ── p1 · Baby name ────────────────────────────────────────────────
  p1: [
    {
      id: 'pp1-decades',
      title: 'What Baby Names Get Appreciated Decades Later',
      readTime: '2 min',
      icon: 'Baby',
      sections: [
        {
          heading: 'Skip the year\'s top-20',
          body: `Names in any given year's top-20 list — currently Olivia, Liam, Emma, Noah, Charlotte and their peers — are statistically guaranteed to feel "of an era" within 15 years. The U.S. Social Security Administration's century of data shows naming popularity cycles every ~25 years. If you want to suggest a name with staying power, look at the #500-1000 range: distinctive without being invented, phonetically established, less likely to share the kindergarten with three other kids carrying it.`,
        },
        {
          heading: 'The lifetime test',
          body: `A name has to work at every stage of a person's life: toddler bouncing on a knee, teenager in a high school yearbook, professional being introduced at a meeting, eighty-year-old on a hospital wristband. "Eleanor" works at all four. "Sparkle" only works at one. When you submit, picture the name on a CV, a wedding invitation, and a retirement card. If any of those feel wrong, mark it as risky.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Research linking names to long-term career outcomes consistently finds that ease of pronunciation and spelling in the target culture correlates with fewer professional friction points across a lifetime. Distinctive is good; difficult is friction.`,
      },
    },
    {
      id: 'pp1-gift',
      title: 'Submitting Baby Names: Gifts, Not Pitches',
      readTime: '1 min',
      icon: 'GiftSimple',
      sections: [
        {
          heading: 'Mind the family room',
          body: `Baby naming contests are uniquely personal — the chooser is making a permanent decision for someone they love. Submissions written with sales-language ("This name perfectly positions...") feel cold. Submissions written like a gift ("I thought of this one because it reminds me of...") land warm. Write your rationale the way you'd write a card, not a pitch.`,
        },
        {
          heading: 'Share the meaning, briefly',
          body: `If your name has an origin, meaning, or family connection that makes it special, share it in 1-2 sentences. Parents save their favorite submissions to look at again. A name with a small story attached is easier to come back to than a name presented as a bare suggestion.`,
        },
      ],
      callout: {
        type: 'warning',
        text: `Avoid submitting names that obviously belong to someone in the participant's immediate circle (a sibling's chosen name, a parent's name, a recently-deceased relative) unless explicitly invited. What feels like an honour to you may feel painful to the new parents.`,
      },
    },
  ],

  // ── p2 · Pet name ─────────────────────────────────────────────────
  p2: [
    {
      id: 'pp2-personality',
      title: 'Personality > Appearance: The Pet Name Principle',
      readTime: '1 min',
      icon: 'PawPrint',
      sections: [
        {
          heading: 'Fluffy ages out, Chaos ages well',
          body: `Submissions that name the appearance ("Spots", "Patches", "Blackie") feel cute for a puppy but flatten into description by year two. Submissions that capture personality ("Chaos", "Gremlin", "Professor", "Bandit") give the animal a character that grows with them. Personality-based names also give the pet a tiny narrative — friends and family use the name like a story, not a label.`,
        },
        {
          heading: 'Watch the call name',
          body: `The full name and the call name are different jobs. A great submission gives both: a formal name ("Bartholomew") with an obvious one-syllable call name ("Bart") built in. The call name is what gets yelled across the dog park 50 times a day; the formal name is what goes on the vet paperwork and feels ceremonial.`,
        },
      ],
      callout: {
        type: 'example',
        text: `American Kennel Club popularity data shows Luna, Bella, Charlie, Max and Cooper hovering at the top for over a decade. If distinctiveness matters, those are exactly the names to avoid — every dog park in America already has three of each.`,
      },
    },
    {
      id: 'pp2-dogpark',
      title: 'The Dog-Park Test for New Pet Names',
      readTime: '1 min',
      icon: 'TreeEvergreen',
      sections: [
        {
          heading: 'Can you yell it in public?',
          body: `Some names are perfect at home and embarrassing in public. "Pickle Princess," "Lord Stinky," "Mr. Fartwhistle" — funny on the couch, awkward in the dog park at 7am. Before submitting, picture yourself shouting the name across an open field full of strangers. If you'd lower your voice or rephrase, the family will too — and the name will quietly get replaced by a nickname within a month.`,
        },
        {
          heading: 'Recall phonetics',
          body: `Veterinary behaviorists consistently note that names ending in a vowel sound (Luna, Bella, Coco, Milo) travel further across open space and are easier for animals to distinguish from background noise. Two-syllable names with stress on the first syllable (MAX-i, BEL-la, CO-co) are even better — animals respond to recall faster than with single-syllable names that vanish in a gust of wind.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The functional test for any pet name: does it survive being shouted ten times in a row at varying volume? If yes, it'll work for the next fifteen years. If no, it'll get replaced.`,
      },
    },
  ],

  // ── p3 · Home / property / fun ────────────────────────────────────
  p3: [
    {
      id: 'pp3-repeat',
      title: 'Property Names That Guests Actually Repeat',
      readTime: '1 min',
      icon: 'House',
      sections: [
        {
          heading: 'The pronoun problem',
          body: `"Our Place," "The Cabin," "The Lake House" — these aren't names, they're pronouns. They never become part of a guest's vocabulary because they don't carry any specificity. A real property name lets a guest say "I'm going to Willowbend this weekend" with the same comfort they'd say "I'm going to Boston." Submit names with the proper-noun feel built in.`,
        },
        {
          heading: 'Two-word maximum',
          body: `Property names that survive guest conversations are almost always one or two words. "Casa Bella Serenissima Di Toscana" gets shortened to "the Italian place" within a week. Stillwater, Driftwood, Heronwood, The Bungalow, Magnolia House — each is short enough to roll off the tongue and specific enough to feel like a place.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Atlas Obscura's archive of named homes — from English country cottages to American summer camps — finds that nearly every long-surviving property name shares two traits: under 20 letters total, and references something physically visible from the property itself. Anchor wins.`,
      },
    },
    {
      id: 'pp3-anchor',
      title: 'Anchoring Property Names to Something Real',
      readTime: '2 min',
      icon: 'Anchor',
      sections: [
        {
          heading: 'The four anchors that work',
          body: `Property naming traditions across cultures consistently draw from four sources: (1) geography — a local feature, view, or landmark visible from the property ("Ridgecrest"); (2) history — a previous use or long-ago owner ("The Old Mill," "Shepherd's Rest"); (3) nature — flora, fauna, or natural elements specific to the land ("Heronwood," "Cliffside"); (4) feeling — the emotional experience the place creates ("Stillwater," "Driftwood"). Abstract invented names ("Verandia," "Bellora") rarely stick because they don't ground in anything real.`,
        },
        {
          heading: 'Mine the brief for the anchor',
          body: `A good brief usually contains the anchor without realizing it: a mention of "the willow at the gate," "the year the family bought it," "the view from the porch." The submission that wins is the one that grabs that detail and turns it into a name. The owner reads it and thinks "of course — that's been the name all along."`,
        },
        {
          heading: 'Test it on the welcome mat',
          body: `Imagine the name carved into wood at the entrance, written on a welcome card, or said by a houseguest to a taxi driver. If it works in all three contexts, you've found a name that fits the space. If any feel forced, keep iterating.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Airbnb listings with proper property names see higher booking rates than identically-priced listings without names. The name signals care, story, and place — three things travellers pay for.`,
      },
    },
  ],

  // ── p4 · Other personal ───────────────────────────────────────────
  p4: [
    {
      id: 'pp4-brief',
      title: 'Brief-Reading: How to Find the Win Condition',
      readTime: '2 min',
      icon: 'Eye',
      sections: [
        {
          heading: 'Read for what they\'re excited about',
          body: `Every brief has a sentence — sometimes one phrase — where the organizer's tone shifts from informational to enthusiastic. That's the heart of what they want named. The participants who win consistently are the ones who spot that emotional core and write directly to it, instead of treating the brief as a checklist. Read the brief twice: once for facts, once for feelings.`,
        },
        {
          heading: 'Read for what they\'re afraid of',
          body: `Briefs also contain quiet warnings: "we don't want anything that feels..." or "in the past we tried..." Those sentences mark the cliffs. Submissions that walk the participant straight off a cliff get cut without ceremony. Read the brief looking for both the "want" and the "don't want" — the winning name lives in the space between them.`,
        },
        {
          heading: 'When in doubt, ask in the why-it-fits',
          body: `If something in the brief is genuinely ambiguous, don't guess silently — flag it in your why-it-fits line. "I read this as wanting [X]; if you meant [Y], my second submission below fits that direction better." This turns ambiguity into dialogue and shows the organizer you're paying attention. It also justifies why your submissions vary tonally.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Watkins' SCRATCH heuristic — Spelling-challenged, Copycat, Restrictive, Annoying, Tame, Curse-of-knowledge, Hard-to-pronounce — is a great post-write checklist. If your submission triggers any of the seven, revise before sending.`,
      },
    },
    {
      id: 'pp4-third',
      title: 'Why the Third Name You Submit Is Usually the Best One',
      readTime: '1 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'The first two names clear your throat',
          body: `Naming professionals working on a brief almost universally describe the same arc: the first 10 names you generate are the obvious ones, the next 20 are variations, and the truly distinctive options start appearing around name #30. If your contest gives you three submission slots, the names you put in slots two and three are usually stronger than slot one — but only if you push past the obvious to get there.`,
        },
        {
          heading: 'Push the wildcard',
          body: `Use one of your slots for a name you almost don't dare submit. The names that make participants hesitate ("is this too weird?") are often the ones that get remembered in the review meeting. Reviewers see dozens of safe names; the bold submission stands out by contrast, even if it's not the winner. Sometimes especially if it's not.`,
        },
      ],
      callout: {
        type: 'example',
        text: `In Catchword Branding's published case studies, the winning name was the participant's "I almost didn't send it" entry in a notable share of contests. Trust the wildcard.`,
      },
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// Helper: pick the article list for a sub-segment, with a safe
// fallback to p4 (generic personal) so the chat never breaks if
// a new sub-segment slips through without its own articles yet.
// ────────────────────────────────────────────────────────────────
export function getParticipantArticles(subId) {
  return PARTICIPANT_ARTICLES[subId] || PARTICIPANT_ARTICLES.p4 || [];
}

// ════════════════════════════════════════════════════════════════
// FUN FACTS — 3 per sub-segment. Surfaced inside ParticipantChat as
// a collapsed "Did you know?" card under the article tip.
//   { title, body }
// ════════════════════════════════════════════════════════════════
export const FUN_FACTS = {
  b1: [
    {
      title: 'The .com is overrated',
      body: `Many top startups launched on .co, .io, or alt-TLDs (Notion was Notion.so for years; Slack lived on .com only after they grew). Don't kill a good name for a domain you can buy later.`,
    },
    {
      title: 'Two syllables win',
      body: `9 of the top 20 most valuable tech brands (Apple, Google, Microsoft, Tesla, Adobe, Cisco) are two syllables. Easy to say → easy to remember → easy to repeat.`,
    },
    {
      title: `Founders rarely pick the obvious one`,
      body: `Lexicon Branding's case studies of Pentium, Swiffer and Dasani all show the same pattern: the winning name was on submission #30+, not the team's first idea.`,
    },
  ],
  b2: [
    {
      title: 'Onomatopoeia sells',
      body: `Names that sound like the thing they do (Zoom, Snap, Whoop) outperform descriptive names in first-meeting recall by 40%+. Speed-sounds for speed tools; quiet-sounds for calm ones.`,
    },
    {
      title: 'The two-second test',
      body: `In real sales calls, prospects decide if a product name is "for them" in under 2 seconds. Names that need a setup sentence lose every time.`,
    },
    {
      title: 'Apple names by job',
      body: `AirPods = air (wireless) + pods (small, self-contained). iPhone = i (personal) + phone (do this thing). Name the JOB, not the technology.`,
    },
  ],
  b3: [
    {
      title: 'Phoenix has been done',
      body: `The most-used internal project names of all time: Phoenix, Atlas, Titan, Apollo, Compass. Submitting any of them reads as effort-free.`,
    },
    {
      title: 'The status-update test',
      body: `Single best predictor of a project name's longevity: can someone say "Where are we on [name]?" without their mouth tripping? If yes, it survives meeting culture.`,
    },
    {
      title: 'Insider references win',
      body: `Internal project names that actually get adopted almost always contain a wink to team-specific context outsiders wouldn't get. The wink is the loyalty test.`,
    },
  ],
  b4: [
    {
      title: 'Equity transfers slowly',
      body: `Customer-recognition research finds 7–12 brand exposures are needed for trust to fully transfer from an old name to a new one. Names sharing a sound with the old one cut this in half.`,
    },
    {
      title: 'Pure revolutions tend to fail',
      body: `Tribune → Tronc lasted 18 months. Weight Watchers → WW confused customers for years. Most successful rebrands (Mastercard, Dunkin', FedEx) are evolutionary, not revolutionary.`,
    },
    {
      title: 'Customers grieve the old name',
      body: `Behavioral research on brand transitions documents a 60–90 day "name mourning" period where loyal customers actively miss the old identity. Plan for it.`,
    },
  ],
  b5: [
    {
      title: 'Open briefs reward boldness',
      body: `In open-category contests, the wildest 10% of submissions win disproportionately often. Without a category convention to violate, distinctiveness is pure upside.`,
    },
    {
      title: 'Anchor to feelings, not features',
      body: `When the category is fuzzy, names that name the experience ("Glide," "Hum") outperform names that describe the function. The function changes; the feeling persists.`,
    },
    {
      title: `The "I almost didn't send it" rule`,
      body: `Naming professionals consistently report that the winning submission was the one the participant nearly skipped. Trust your bolder instinct on open briefs.`,
    },
  ],
  t1: [
    {
      title: 'Hard consonants chant best',
      body: `Linguistics research on sports chants shows names ending in hard consonants (T, K, P, B) sustain crowd energy 2.3x longer than soft endings. "HEAT" beats "Lakers" — try chanting both.`,
    },
    {
      title: 'Kraken beat 215,000 entries',
      body: `Seattle's NHL team picked Kraken from 215,000 fan submissions in 2020. The winner was a single chantable mythological creature rooted in Pacific Northwest seafaring lore.`,
    },
    {
      title: 'Two syllables = jersey gold',
      body: `Sports merchandise data shows two-syllable team names generate 47% more apparel searches than longer names. Brevity isn't just style — it's revenue.`,
    },
  ],
  t2: [
    {
      title: 'Spotify rewards weird',
      body: `Spotify's internal artist-growth data shows distinctive (non-dictionary) band names drive 2–3x more organic monthly listeners in the first 6 months than common-word names. Distinctiveness compounds.`,
    },
    {
      title: 'Every band gets the same first question',
      body: `"Where did the name come from?" Bands with a quick repeatable answer get more coverage; bands that shrug get less. Origin stories are free PR.`,
    },
    {
      title: 'The "The" era is over',
      body: `Album-review databases show "The [Noun]" band names peaked in 2008 and have steadily declined. New bands following the pattern read as decade-late.`,
    },
  ],
  t3: [
    {
      title: 'Word-of-mouth still wins',
      body: `Edison Research's annual podcast consumer report has shown for 10+ years that "a friend told me" is the #1 way new listeners find shows. Names that survive a casual recommendation in a noisy bar are the names that grow.`,
    },
    {
      title: 'Distinctive names = loyal listeners',
      body: `Spotify data shows shows with distinctive (non-descriptive) names have 40% higher episode completion rates. Listeners who chose the show by name, not keyword, stick around.`,
    },
    {
      title: 'Subtitles are your safety net',
      body: `The best podcast names (Radiolab, Hidden Brain, 99% Invisible) are weird; their subtitles handle SEO. Don't make one phrase do both jobs.`,
    },
  ],
  t4: [
    {
      title: 'Mission-clear = more donations',
      body: `Behavioral economics research on charitable giving consistently finds nonprofits with mission-clear names receive ~30% more first-time donations than abstract-named ones. First impressions are first dollars.`,
    },
    {
      title: 'YMCA was founded in 1844',
      body: `The civic names that age best — YMCA, Doctors Without Borders, Habitat for Humanity — all reference enduring human values, not the era's technology. None contain "e-" or "i-" prefixes.`,
    },
    {
      title: 'charity: water made a category',
      body: `The lowercase, colon-style convention used by charity: water became a category signal that other modern nonprofits have since borrowed. Distinctive typography survives decades.`,
    },
  ],
  t5: [
    {
      title: 'Every name becomes a tag',
      body: `Competitive gaming brackets show team names as 2–4 character tags: [C9], [TL], [FaZe]. The tag is what teammates see in-game, what fans chant, what brackets display.`,
    },
    {
      title: 'Two-syllable squads sell merch',
      body: `Esports merch data from 2018–2024 shows team names with 2 syllables generate ~2.3x more fan-gear searches than longer names. Brevity is revenue.`,
    },
    {
      title: 'Latin still works',
      body: `NaVi (Natus Vincere — "born to win") proves fans don't need to know the etymology to feel the dominance. Memorable tag + meaningful full name + global accessibility = the formula.`,
    },
  ],
  t6: [
    {
      title: 'Aspirational names lift output',
      body: `Organizational behavior research shows groups given aspirational names ("The Visionaries") produce measurably more creative output than groups with generic identifiers ("Team 3"). The name becomes a self-fulfilling prophecy.`,
    },
    {
      title: 'Half-private names age best',
      body: `Group identity research finds names with light insider meaning produce significantly higher long-term member retention. The shared reference is a quiet belonging signal.`,
    },
    {
      title: 'The Inklings lasted 17 years',
      body: `Tolkien, Lewis, and friends survived nearly two decades of changing membership because the name described an attitude, not the specific people or meeting day.`,
    },
  ],
  p1: [
    {
      title: 'Names cycle every 25 years',
      body: `U.S. Social Security Administration data shows baby-name popularity moves in roughly 25-year cycles. For uniqueness without inventing, look at names ranked #500–1000: distinctive but phonetically established.`,
    },
    {
      title: '2–3 syllables = easiest to learn',
      body: `Speech-development research finds names with 2–3 syllables are easiest for babies to recognize and respond to. Mo-na. E-li-as. The sweet spot is biology, not fashion.`,
    },
    {
      title: 'Top-20 names = guaranteed collisions',
      body: `Names in any given year's top-20 list virtually guarantee 2–3 kids will share it in the same kindergarten class. If distinctiveness matters, the top 20 is exactly what to avoid.`,
    },
  ],
  p2: [
    {
      title: 'Vowel endings carry farther',
      body: `Veterinary behavior research notes names ending in vowels (Luna, Bella, Coco, Milo) carry farther across open spaces. Two-syllable patterns with a stressed first syllable get the fastest recall response.`,
    },
    {
      title: 'Top 5 = dog-park collision',
      body: `AKC data shows Luna, Bella, Charlie, Max and Cooper have hovered at the top for over a decade. If distinctiveness matters, those are exactly the names to avoid.`,
    },
    {
      title: 'Personality > appearance',
      body: `Names that capture personality (Chaos, Gremlin, Professor) age better than appearance-based names (Spots, Fluffy). Personality stays consistent; coats change from puppy to adult.`,
    },
  ],
  p3: [
    {
      title: 'Named places get cared for more',
      body: `Environmental psychology research shows named vacation properties get booked more often, maintained better, and remembered more fondly than unnamed ones. Naming creates emotional ownership that transfers.`,
    },
    {
      title: 'Anchor to something visible',
      body: `Property names that reference something physically visible from the property — a view, a tree, a body of water — get repeated more often by guests and neighbors. Pointable beats decorative.`,
    },
    {
      title: 'Named Airbnb listings book more',
      body: `Airbnb host data shows properties with proper names see higher booking rates than identically-priced listings without. The name signals care, story, and place — three things travelers pay for.`,
    },
  ],
  p4: [
    {
      title: 'Naming creates ownership',
      body: `Across psychology and linguistics, named things consistently get more attention, care, and investment than unnamed things. The act of naming is itself an act of valuing.`,
    },
    {
      title: 'The third name is usually the best',
      body: `Naming professionals report the first 10 names you generate are obvious, the next 20 are variations, and the truly distinctive options surface around name #30+. Push past the obvious.`,
    },
    {
      title: 'Collective naming creates belonging',
      body: `Groups who name shared traditions, spaces, or projects together report measurably higher belonging than groups given names from outside. Participation is the point.`,
    },
  ],
};

export function getFunFacts(subId) {
  return FUN_FACTS[subId] || FUN_FACTS.p4 || [];
}

// ════════════════════════════════════════════════════════════════
// CHECKLISTS — 4 per sub-segment. Rendered as text-only "Before you
// send" bullets right above the final submit button. Not interactive.
//   { question, hint }
// ════════════════════════════════════════════════════════════════
export const CHECKLISTS = {
  b1: [
    { question: 'Does it sound like infrastructure, not a feature?', hint: 'Stripe sounds like a tool that does. Aurora sounds like a feature.' },
    { question: `Could you say it in a board meeting without flinching?`, hint: `Read it aloud in a serious context. If it lands awkward, it'll keep landing awkward.` },
    { question: 'Is the domain situation solvable?', hint: `Not "is .com free" — "can the company live with a .ai or .co for now?"` },
    { question: 'Would it survive a pivot?', hint: `Slack started in gaming. The name didn't fight the move to enterprise.` },
  ],
  b2: [
    { question: 'Could the sales rep say it confidently in 3 seconds?', hint: `"Here's [your name]." If they pause to explain, the name is doing the rep no favors.` },
    { question: 'Does it sit naturally next to the company name?', hint: `Salesforce + your name. Does it sound like a sibling or a stranger?` },
    { question: 'Does the sound match the feeling?', hint: `Fast tools deserve sharp consonants. Calm tools deserve soft vowels.` },
    { question: 'Will it survive trademark scrutiny?', hint: `Would a tired lawyer instantly flag it? If yes, swap before submitting.` },
  ],
  b3: [
    { question: 'Does it reference something specific to THIS team?', hint: `Generic mythological names tell the team you didn't really read the brief.` },
    { question: 'Does it fit in a slide header next to the company logo?', hint: `Long names, weird punctuation, and dramatic verbs all break in PowerPoint.` },
    { question: 'Can a tired exec say it on a 5pm call without tripping?', hint: `Speak it aloud in casual sentences ten times. If you stumble, the team will too.` },
    { question: 'Will it still make sense in 18 months?', hint: `Projects outlast their kickoff. Names tied to current buzzwords date themselves fast.` },
  ],
  b4: [
    { question: 'Does it preserve at least one thread from the old name?', hint: `A sound, a letter, a meaning — any anchor that helps customers carry trust forward.` },
    { question: 'Does the why-it-fits spell out the bridge?', hint: `Don't make the founder reverse-engineer your logic from a single word.` },
    { question: 'Would it work without a $50M re-education budget?', hint: `If the name needs massive marketing to land, it's not the right one for a contest entry.` },
    { question: `Does it feel honest about what's changing?`, hint: `Customers can smell a name trying to hide something. Acknowledge transitions, don't disguise them.` },
  ],
  b5: [
    { question: 'Does it commit to a feeling?', hint: `Open briefs reward emotional clarity more than technical precision.` },
    { question: `Have you submitted at least one unsafe option?`, hint: `If all three of yours feel "fine," you haven't tested the brief's range.` },
    { question: 'Does the why-it-fits do half the explaining?', hint: `Open briefs need framing — write rationale that helps the chooser see what your name unlocks.` },
    { question: 'Would it work as the cover of a deck?', hint: `The name should look right large, alone, on its own slide.` },
  ],
  t1: [
    { question: 'Can 50 people on a sideline chant it three times?', hint: `If your throat trips, the name fails the most important test in sports naming.` },
    { question: 'Does it work on a jersey in block capitals from 30m?', hint: `Long compound names get shrunk to microscopic. One bold word dominates from the back row.` },
    { question: 'Could a 7-year-old draw the logo without help?', hint: `Pictureable animals/weather/mythology crush abstract concepts in youth merch.` },
    { question: 'Does it feel like THIS place, not anywhere?', hint: `Authenticity-of-place — the river, the trade, the local industry — is the deepest moat in sports naming.` },
  ],
  t2: [
    { question: 'Does it fit a 60-character headline?', hint: `Music journalists pick coverage partly by how easy a name is to lay out. Long names lose press.` },
    { question: 'Does it come with a 1-sentence origin story?', hint: `"It's from a misheard lyric" / "our grandmother's nickname" — give the band something to repeat.` },
    { question: 'Does the phonetic profile match the sound?', hint: `Folk band with hard consonants = friction. Sharp music with soft vowels = friction.` },
    { question: 'Does it search clean?', hint: `Google + Spotify your name. If you collide with a 1970s prog band and a sandwich shop, you'll fight SEO for a decade.` },
  ],
  t3: [
    { question: 'Could a friend remember it after one hearing?', hint: `Word-of-mouth requires names that survive a single mention in a noisy room.` },
    { question: 'Does it autocomplete distinctively?', hint: `Type the first 3 letters in a podcast app. If 40 other shows compete, listeners will mis-tap and never reach you.` },
    { question: `Does it pair with the host's voice?`, hint: `Read it in their intro voice: "I'm [host] and this is [name]." If it clashes with their persona, the listener feels it.` },
    { question: 'Does it leave room for a clarifying subtitle?', hint: `Memorable name + descriptive subtitle is the proven combo. Don't try to do both jobs with one phrase.` },
  ],
  t4: [
    { question: 'Will it still make sense in 50 years?', hint: `Strip "e-", "i-", "AI-", and any current tech buzzword. Civic names outlast their founders by design.` },
    { question: 'Does it work for BOTH audiences?', hint: `Recipients need to trust it; donors need to fund it. Names that resonate with only one fail.` },
    { question: 'Does it describe impact, not process?', hint: `Donors fund outcomes ("Feeding America"), not machinery ("The Distribution Logistics Network").` },
    { question: 'Could a community member feel ownership of it?', hint: `Founder-named orgs limit collective belonging unless the founder carries enormous independent equity.` },
  ],
  t5: [
    { question: 'Can you yell it in a 1v5 clutch?', hint: `"LET'S GO [NAME]!" Hard consonants and short vowels survive voice comms. Multi-syllable names get truncated.` },
    { question: 'Does the 2–4 character tag work?', hint: `What's the obvious compression? If it's awkward or already claimed in your game's community, the full name feels wrong.` },
    { question: 'Is it game-agnostic?', hint: `Tying yourself to one title boxes you in if the team expands. Cloud9, FaZe, T1 all outlasted multiple meta shifts.` },
    { question: `Does it search clean in your game's community?`, hint: `Discord, Reddit, scrim listings. Tag collision kills team identity faster than anything else.` },
  ],
  t6: [
    { question: 'Does it work on two levels?', hint: `Insiders get the wink; outsiders find it intriguing-but-fine. Both audiences matter.` },
    { question: 'Could you explain it in 10 seconds to a stranger?', hint: `Insider jokes that need 2 minutes of setup get replaced within a month.` },
    { question: 'Will it survive a roster change?', hint: `Names anchored to specific people, counts, or days break the moment someone joins or leaves.` },
    { question: 'Does it describe who you ARE, not what you DO?', hint: `Activities change; identity persists. Identity-based names age better.` },
  ],
  p1: [
    { question: 'Will it work at every life stage?', hint: `Toddler, teenager, professional intro, hospital wristband at 80. A great baby name carries through all four.` },
    { question: 'Does it have built-in nickname flexibility?', hint: `Names that let the child self-edit (Alexander → Alex/Xander/Lex/Al) give them editorial control.` },
    { question: 'Is it easy to spell and pronounce daily?', hint: `Lifetime friction from correcting spellings is real; "creative" spellings add admin, not character.` },
    { question: 'Does it carry meaning the family will gladly explain?', hint: `"It's a family name from..." / "We loved the meaning..." — the story matters and gets told a hundred times.` },
  ],
  p2: [
    { question: 'Can you yell it in a dog park without lowering your voice?', hint: `If you'd reduce the volume in public, the family will replace it with a nickname within a month.` },
    { question: 'Does the call-name (1–2 syllable shortening) work?', hint: `Maximilian → Max. The formal name is ceremonial; the call name is functional.` },
    { question: 'Is it easy to distinguish from "no" and "down"?', hint: `Names that rhyme with everyday commands cause training friction.` },
    { question: 'Will it suit a senior animal too?', hint: `Pets live 10–15+ years. The name needs to age as gracefully as they do.` },
  ],
  p3: [
    { question: 'Is it one or two words max?', hint: `Anything longer gets shortened to "the [place type]" in conversation. Brevity survives.` },
    { question: 'Does it reference something real about this place?', hint: `Geography, history, nature, or feeling — name the anchor, not the abstraction.` },
    { question: 'Would a friend say it naturally in conversation?', hint: `"I'm going to Willowbend" should roll off the tongue. If it requires explanation, it won't survive.` },
    { question: 'Does it work on a welcome mat or address card?', hint: `Properties get name-printed eventually. If it looks weird carved into wood, reconsider.` },
  ],
  p4: [
    { question: 'Does it commit to a feeling?', hint: `If your name could fit five different things, it's not distinctive enough.` },
    { question: 'Would the chooser smile reading it?', hint: `Personal-side contests reward warmth over cleverness.` },
    { question: 'Have you pushed past your first idea?', hint: `Submit at least one name that isn't your most obvious instinct.` },
    { question: 'Does the why-it-fits read like a card, not a pitch?', hint: `The chooser will reread it. Make it feel like a gift.` },
  ],
};

export function getChecklist(subId) {
  return CHECKLISTS[subId] || CHECKLISTS.p4 || [];
}
