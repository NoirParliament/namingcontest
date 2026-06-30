// Shared per-segment chat theming used by BOTH BriefChat (setup) and
// ContestManage (post-launch). Carries identity from setup → live.
//
// Each segment defines:
//   • blobs       — 4 background colors (only design-doc panel tokens)
//   • iconPositions — 4-5 different Phosphor icons scattered around
//   • images      — anchor (top-right) + accent (bottom-left) PNGs
//
// Color palette (only these — design-doc panel tokens):
//   periwinkle #b3c4f0 · mint #a6dcb3 · butter #fceebc
//   sky        #c4dffb · blush #fadecc

import {
  // Per-segment scattered theme icons
  Baby, PawPrint, Bone, FishSimple, Heart, Bird,
  House, Tree, MapPin, Sun, Plant,
  Star, Moon, Cloud, Sparkle, Smiley,
  SoccerBall, Trophy, Lightning, Medal, Flag,
  MusicNote, Guitar, Microphone, Headphones, VinylRecord,
  Broadcast, ChatCircle,
  GraduationCap, HandHeart, HandsClapping, HandFist, UsersThree, UsersFour,
  GameController, Sword, Crown, PencilSimple,
  Buildings, Briefcase, Compass, Target, Lightbulb, Rocket,
  Package, ChartLine,
  ClipboardText, CheckCircle,
  ArrowsClockwise as RebrandIcon, PaintBrushBroad,
} from '@phosphor-icons/react';

// Per-segment illustration PNGs — `1` lands in the anchor slot (right
// side, top), `2` lands in the accent slot (left side, bottom).
import dogPng        from '../../assets/dog.png';
import parrotPng     from '../../assets/parrot.png';
import baby1Png      from '../../assets/baby 1.png';
import baby2Png      from '../../assets/baby 2.png';
import home1Png      from '../../assets/home 1.png';
import home2Png      from '../../assets/home 2.png';
import sports1Png    from '../../assets/sportsteam1.png';
import sports2Png    from '../../assets/sportsteam2.png';
import band1Png      from '../../assets/band 1.png';
import band2Png      from '../../assets/band 2.png';
import podcast1Png   from '../../assets/podcast 1.png';
import podcast2Png   from '../../assets/podcast 2.png';
import nonprofit1Png from '../../assets/nonprofit 1.png';
import nonprofit2Png from '../../assets/nonprofit 2.png';
import gaming1Png    from '../../assets/gaming 1.png';
import gaming2Png    from '../../assets/gaming 2.png';
import company1Png   from '../../assets/company 1.png';
import company2Png   from '../../assets/company 2.png';
import product1Png   from '../../assets/product 1.png';
import product2Png   from '../../assets/product 2.png';
import project1Png   from '../../assets/project 1.png';
import project2Png   from '../../assets/project 2.png';
import rebrand1Png   from '../../assets/rebrand 1.png';
import rebrand2Png   from '../../assets/rebrand 2.png';
import somethingElse1Png from '../../assets/something else.png';
import somethingElse2Png from '../../assets/something else 2.png';
// Faint line-art scene anchored at the bottom of the dashboard, per segment.
import aSportsTeamPng from '../../assets/a-sports-team.png';
import aBandMusicPng from '../../assets/a-band-or-music-group.png';
import aPodcastPng from '../../assets/podcast.png';
import aCommunityPng from '../../assets/community.png';
import aGamingPng from '../../assets/gaming.png';
import aBrainstormPng from '../../assets/brainstorm.png';

// Standard image template positions (locked):
//   ANCHOR slot:  top: 22%, right: 24px, width: 240, rotate: -3deg
//   ACCENT slot:  bottom: 16%, left: 24px, width: 190, rotate: 4deg
const ANCHOR_POS = { top: '22%',    right: '24px', width: 240, opacity: 1, rotate: '-3deg' };
const ACCENT_POS = { bottom: '16%', left: '24px',  width: 190, opacity: 1, rotate: '4deg'  };

export const SEGMENT_THEME = {
  // ── Personal ──
  p1: { // Baby — card tone: pink → mapped to blush
    blobs: ['#fadecc', '#fadecc', '#fadecc', '#fceebc'],
    iconPositions: [
      { Icon: Baby,  top: '14%', left: '7%',  size: 46, rotate: '-10deg' },
      { Icon: Star,  top: '32%', right: '6%', size: 30, rotate: '14deg'  },
      { Icon: Moon,  top: '58%', left: '4%',  size: 36, rotate: '8deg'   },
      { Icon: Cloud, top: '72%', right: '10%',size: 44, rotate: '-12deg' },
      { Icon: Heart, bottom: '8%', left: '20%',size: 32, rotate: '20deg' },
    ],
    images: [{ ...ANCHOR_POS, src: baby1Png }, { ...ACCENT_POS, src: baby2Png }],
  },
  p2: { // Pet — card tone: butter
    blobs: ['#fceebc', '#fceebc', '#fadecc', '#fceebc'],
    iconPositions: [
      { Icon: PawPrint,   top: '14%', left: '7%', size: 44, rotate: '-12deg' },
      { Icon: Bone,       top: '36%', right: '6%', size: 36, rotate: '18deg' },
      { Icon: Bird,       top: '58%', left: '4%', size: 34, rotate: '24deg'  },
      { Icon: Heart,      top: '72%', right: '12%', size: 34, rotate: '-8deg'},
      { Icon: FishSimple, bottom: '8%', left: '18%', size: 38, rotate: '32deg'},
    ],
    images: [{ ...ANCHOR_POS, src: dogPng }, { ...ACCENT_POS, src: parrotPng }],
  },
  p3: { // Home / property — card tone: mint
    blobs: ['#a6dcb3', '#a6dcb3', '#a6dcb3', '#fceebc'],
    iconPositions: [
      { Icon: House,  top: '14%', left: '7%',   size: 42, rotate: '-8deg'  },
      { Icon: Tree,   top: '36%', right: '6%',  size: 38, rotate: '12deg'  },
      { Icon: Sun,    top: '58%', left: '4%',   size: 34, rotate: '0deg'   },
      { Icon: MapPin, top: '72%', right: '12%', size: 32, rotate: '-14deg' },
      { Icon: Plant,  bottom: '8%', left: '18%', size: 36, rotate: '20deg' },
    ],
    images: [{ ...ANCHOR_POS, src: home1Png }, { ...ACCENT_POS, src: home2Png }],
  },
  p4: { // Other personal
    blobs: ['#b3c4f0', '#b3c4f0', '#fadecc', '#fceebc'],
    iconPositions: [
      { Icon: Heart,   top: '16%', left: '8%',  size: 38, rotate: '-10deg' },
      { Icon: Sparkle, top: '38%', right: '8%', size: 34, rotate: '16deg'  },
      { Icon: Star,    top: '60%', left: '6%',  size: 32, rotate: '8deg'   },
      { Icon: Sun,     top: '74%', right: '14%', size: 36, rotate: '-6deg' },
      { Icon: Smiley,  bottom: '10%', left: '22%', size: 34, rotate: '24deg'},
    ],
    images: [{ ...ANCHOR_POS, src: somethingElse1Png }, { ...ACCENT_POS, src: somethingElse2Png }],
  },

  // ── Group ──
  t1: { // Sports team
    blobs: ['#a6dcb3', '#a6dcb3', '#a6dcb3', '#c4dffb'],
    iconPositions: [
      { Icon: SoccerBall, top: '14%', left: '7%', size: 42, rotate: '-12deg' },
      { Icon: Trophy,     top: '36%', right: '6%', size: 38, rotate: '14deg' },
      { Icon: Lightning,  top: '58%', left: '4%', size: 34, rotate: '20deg' },
      { Icon: Medal,      top: '72%', right: '12%', size: 36, rotate: '-8deg'},
      { Icon: Flag,       bottom: '8%', left: '18%', size: 32, rotate: '18deg'},
    ],
    // Sports team huddle PNG fills its frame edge-to-edge (no transparent
    // margin like the other illustrations), so push the anchor inward
    // ~36px extra to match the visual breathing room other segments get.
    // Trophy accent is nudged down + further left so it climbs onto the
    // bottom-left mint blob, the way other segments sit on theirs.
    images: [
      { ...ANCHOR_POS, right: '60px', src: sports1Png },
      { ...ACCENT_POS, left: '8px', src: sports2Png },
    ],
  },
  t2: { // Band
    blobs: ['#b3c4f0', '#b3c4f0', '#b3c4f0', '#fadecc'],
    iconPositions: [
      { Icon: Guitar,      top: '14%', left: '7%', size: 44, rotate: '-10deg' },
      { Icon: MusicNote,   top: '36%', right: '6%', size: 38, rotate: '12deg' },
      { Icon: Microphone,  top: '58%', left: '4%', size: 36, rotate: '20deg' },
      { Icon: Headphones,  top: '72%', right: '12%', size: 38, rotate: '-8deg'},
      { Icon: VinylRecord, bottom: '8%', left: '18%', size: 36, rotate: '24deg'},
    ],
    images: [{ ...ANCHOR_POS, src: band1Png }, { ...ACCENT_POS, src: band2Png }],
  },
  t3: { // Podcast
    blobs: ['#c4dffb', '#c4dffb', '#c4dffb', '#fceebc'],
    iconPositions: [
      { Icon: Microphone, top: '14%', left: '7%', size: 46, rotate: '-12deg' },
      { Icon: Broadcast,  top: '36%', right: '6%', size: 38, rotate: '14deg' },
      { Icon: Headphones, top: '58%', left: '4%', size: 36, rotate: '8deg'   },
      { Icon: ChatCircle, top: '72%', right: '12%', size: 34, rotate: '-10deg'},
      { Icon: Star,       bottom: '8%', left: '18%', size: 30, rotate: '20deg'},
    ],
    images: [{ ...ANCHOR_POS, src: podcast1Png }, { ...ACCENT_POS, src: podcast2Png }],
  },
  t4: { // Civic / nonprofit
    blobs: ['#fadecc', '#fadecc', '#fadecc', '#a6dcb3'],
    iconPositions: [
      { Icon: GraduationCap, top: '14%', left: '7%',  size: 42, rotate: '-8deg' },
      { Icon: HandHeart,     top: '36%', right: '6%', size: 40, rotate: '14deg' },
      { Icon: UsersThree,    top: '58%', left: '4%',  size: 36, rotate: '8deg'  },
      { Icon: Tree,          top: '72%', right: '12%', size: 38, rotate: '-12deg'},
      { Icon: Heart,         bottom: '8%', left: '18%', size: 32, rotate: '20deg'},
    ],
    images: [{ ...ANCHOR_POS, src: nonprofit1Png }, { ...ACCENT_POS, src: nonprofit2Png }],
  },
  t5: { // Gaming
    blobs: ['#fceebc', '#fceebc', '#fceebc', '#b3c4f0'],
    iconPositions: [
      { Icon: GameController, top: '14%', left: '7%', size: 46, rotate: '-12deg' },
      { Icon: Lightning,      top: '36%', right: '6%', size: 36, rotate: '14deg' },
      { Icon: Crown,          top: '58%', left: '4%', size: 34, rotate: '8deg'   },
      { Icon: Sword,          top: '72%', right: '12%', size: 38, rotate: '-10deg'},
      { Icon: Trophy,         bottom: '8%', left: '18%', size: 32, rotate: '22deg'},
    ],
    images: [{ ...ANCHOR_POS, src: gaming1Png }, { ...ACCENT_POS, src: gaming2Png }],
  },
  t6: { // Other team
    blobs: ['#b3c4f0', '#b3c4f0', '#b3c4f0', '#fceebc'],
    iconPositions: [
      { Icon: UsersThree, top: '14%', left: '7%', size: 46, rotate: '-10deg' },
      { Icon: Heart,      top: '36%', right: '6%', size: 34, rotate: '14deg' },
      { Icon: Star,       top: '58%', left: '4%', size: 32, rotate: '8deg'   },
      { Icon: Sparkle,    top: '72%', right: '12%', size: 36, rotate: '-8deg'},
      { Icon: Smiley,     bottom: '8%', left: '18%', size: 34, rotate: '20deg'},
    ],
    images: [{ ...ANCHOR_POS, src: somethingElse1Png }, { ...ACCENT_POS, src: somethingElse2Png }],
  },

  // ── Business ──
  b1: { // Company / startup
    blobs: ['#b3c4f0', '#b3c4f0', '#b3c4f0', '#a6dcb3'],
    iconPositions: [
      { Icon: Buildings, top: '14%', left: '7%', size: 44, rotate: '-8deg'  },
      { Icon: Compass,   top: '36%', right: '6%', size: 36, rotate: '14deg' },
      { Icon: Target,    top: '58%', left: '4%', size: 34, rotate: '8deg'   },
      { Icon: Lightbulb, top: '72%', right: '12%', size: 38, rotate: '-12deg'},
      { Icon: Rocket,    bottom: '8%', left: '18%', size: 36, rotate: '24deg'},
    ],
    images: [{ ...ANCHOR_POS, src: company1Png }, { ...ACCENT_POS, src: company2Png }],
  },
  b2: { // Product
    blobs: ['#fceebc', '#fceebc', '#fceebc', '#c4dffb'],
    iconPositions: [
      { Icon: Package,   top: '14%', left: '7%', size: 44, rotate: '-10deg' },
      { Icon: Sparkle,   top: '36%', right: '6%', size: 34, rotate: '14deg' },
      { Icon: Lightbulb, top: '58%', left: '4%', size: 36, rotate: '8deg'   },
      { Icon: ChartLine, top: '72%', right: '12%', size: 38, rotate: '-8deg' },
      { Icon: Rocket,    bottom: '8%', left: '18%', size: 34, rotate: '22deg'},
    ],
    images: [{ ...ANCHOR_POS, src: product1Png }, { ...ACCENT_POS, src: product2Png }],
  },
  b3: { // Project
    blobs: ['#fadecc', '#fadecc', '#fadecc', '#b3c4f0'],
    iconPositions: [
      { Icon: ClipboardText, top: '14%', left: '7%', size: 42, rotate: '-8deg' },
      { Icon: Target,        top: '36%', right: '6%', size: 36, rotate: '14deg' },
      { Icon: CheckCircle,   top: '58%', left: '4%', size: 34, rotate: '8deg' },
      { Icon: Lightbulb,     top: '72%', right: '12%', size: 36, rotate: '-12deg'},
      { Icon: Compass,       bottom: '8%', left: '18%', size: 32, rotate: '20deg'},
    ],
    images: [{ ...ANCHOR_POS, src: project1Png }, { ...ACCENT_POS, src: project2Png }],
  },
  b4: { // Rebrand
    blobs: ['#a6dcb3', '#a6dcb3', '#a6dcb3', '#b3c4f0'],
    iconPositions: [
      { Icon: RebrandIcon,    top: '14%', left: '7%', size: 42, rotate: '-10deg' },
      { Icon: Sparkle,        top: '36%', right: '6%', size: 34, rotate: '14deg' },
      { Icon: PaintBrushBroad,top: '58%', left: '4%', size: 38, rotate: '8deg' },
      { Icon: Target,         top: '72%', right: '12%', size: 34, rotate: '-12deg'},
      { Icon: Lightbulb,      bottom: '8%', left: '18%', size: 32, rotate: '22deg'},
    ],
    images: [{ ...ANCHOR_POS, src: rebrand1Png }, { ...ACCENT_POS, src: rebrand2Png }],
  },
  b5: { // Other business
    blobs: ['#c4dffb', '#c4dffb', '#c4dffb', '#a6dcb3'],
    iconPositions: [
      { Icon: Sparkle,   top: '16%', left: '8%', size: 38, rotate: '-10deg' },
      { Icon: Lightbulb, top: '38%', right: '8%', size: 34, rotate: '14deg' },
      { Icon: Target,    top: '60%', left: '6%', size: 32, rotate: '8deg'   },
      { Icon: Rocket,    top: '74%', right: '14%', size: 36, rotate: '-8deg'},
      { Icon: Star,      bottom: '10%', left: '22%', size: 30, rotate: '20deg'},
    ],
    images: [{ ...ANCHOR_POS, src: somethingElse1Png }, { ...ACCENT_POS, src: somethingElse2Png }],
  },
};

// Map of design-doc panel bg colors → matching foreground/text colors.
// Used by getSegmentTone() so a segment's icon/accent color travels with
// it across surfaces (hero badge, journey active step, avatar pills, etc.).
const TONE_BY_BG = {
  '#fadecc': { bg: '#fadecc', fg: '#9c4818' }, // blush
  '#fceebc': { bg: '#fceebc', fg: '#8a6a14' }, // butter
  '#a6dcb3': { bg: '#a6dcb3', fg: '#1f5430' }, // mint (panel)
  '#bce5c8': { bg: '#bce5c8', fg: '#1f5430' }, // mint (lighter)
  '#b3c4f0': { bg: '#b3c4f0', fg: '#283b78' }, // periwinkle (panel)
  '#c4cff5': { bg: '#c4cff5', fg: '#283b78' }, // periwinkle (lighter)
  '#c4dffb': { bg: '#c4dffb', fg: '#1d4f7a' }, // sky
};

// Returns the segment's primary tone — derived from its first blob color.
// Falls back to blush if the segment isn't found or its color is unknown.
export function getSegmentTone(subId) {
  const theme = subId ? SEGMENT_THEME[subId] : null;
  const primary = theme?.blobs?.[0];
  return TONE_BY_BG[primary] || TONE_BY_BG['#fadecc'];
}

// 5-color Boring Avatars palette per segment family. The first colour
// in each palette is the segment's dominant tone (so faces lean into
// the same family the page is washed in), followed by the other NC
// panel colours. We deliberately exclude --accent-purple (#4b68c3):
// in the design system it only appears as a tiny faded decor dot
// (opacity 0.45), never as a full block of colour. Big bauhaus discs
// of it read as a foreign brand. The 5 panel pastels are the only
// colours that exist as solid surfaces in the design system.
const PALETTE_BY_PRIMARY = {
  '#fadecc': ['#fadecc', '#fceebc', '#a6dcb3', '#b3c4f0', '#c4dffb'], // blush-led
  '#fceebc': ['#fceebc', '#fadecc', '#a6dcb3', '#c4dffb', '#b3c4f0'], // butter-led
  '#a6dcb3': ['#a6dcb3', '#fceebc', '#c4dffb', '#fadecc', '#b3c4f0'], // mint-led
  '#bce5c8': ['#bce5c8', '#fceebc', '#c4dffb', '#fadecc', '#b3c4f0'], // mint-lighter
  '#b3c4f0': ['#b3c4f0', '#c4dffb', '#fadecc', '#a6dcb3', '#fceebc'], // periwinkle-led
  '#c4cff5': ['#c4cff5', '#c4dffb', '#fadecc', '#a6dcb3', '#fceebc'], // periwinkle-lighter
  '#c4dffb': ['#c4dffb', '#b3c4f0', '#a6dcb3', '#fceebc', '#fadecc'], // sky-led
};
const DEFAULT_PALETTE = ['#fadecc', '#fceebc', '#a6dcb3', '#c4dffb', '#b3c4f0'];

// Returns the 5-color Boring Avatars palette tied to a segment's
// primary blob color. Falls back to a balanced NC palette for
// unknown segments. Same input → same output (memoizable upstream).
export function getSegmentPalette(subId) {
  const theme = subId ? SEGMENT_THEME[subId] : null;
  const primary = theme?.blobs?.[0];
  return PALETTE_BY_PRIMARY[primary] || DEFAULT_PALETTE;
}

// Per-segment hero icon — shows up in the .v4-review-badge slot on
// the Review & Launch screen and the Manage hero. Picked to evoke
// the category WITHOUT locking in a specific instance — so Sports
// uses Trophy (every sport has a trophy) instead of SoccerBall
// (which would mis-cue a basketball or hockey contest). Pet uses
// PawPrint instead of Dog, etc.
export const SEGMENT_ICON = {
  // Personal
  p1: Baby,           // Baby
  p2: PawPrint,       // Pet — any species
  p3: House,          // Home / property
  p4: PencilSimple,   // Other personal — matches the segment picker.
  // Team
  t1: UsersThree,     // Sports team — matches the team-tier icon used
                      //   in the workspace, so it reads as the same
                      //   "team" everywhere. Sport-agnostic. Trophy
                      //   stays reserved for the winner reveal.
  t2: Guitar,         // Band
  t3: Microphone,     // Podcast
  t4: GraduationCap,  // School / club / nonprofit — matches picker.
  t5: GameController, // Gaming
  t6: PencilSimple,   // Other team — distinct from t1's UsersThree;
                      //   matches the segment picker icon.
  // Business
  b1: Buildings,      // Company / startup
  b2: Package,        // Product
  b3: Target,         // Project / initiative — matches picker.
  b4: RebrandIcon,    // Rebrand
  b5: PencilSimple,   // Other business — matches the segment picker.
};

export function getSegmentIcon(subId) {
  // Use the segment's EXACT lead icon (the same one the backdrop scatters —
  // SoccerBall for sports, PawPrint for pets, Buildings for business…) so the
  // project/contest badge always matches its segment. Falls back to the
  // category icon, then null.
  const theme = subId ? SEGMENT_THEME[subId] : null;
  return theme?.iconPositions?.[0]?.Icon || SEGMENT_ICON[subId] || null;
}

// Convenience component renderer for all theme decoration (blobs + icons + images).
// Place inside a positioned ancestor (v4-screen has position: relative).
// Pass `subId` to get that segment's full theme — null/undefined = default blobs only.
import React from 'react';

// Per-segment faint line-art scene anchored at the bottom of the dashboard.
// Segments without one fall back to the scattered theme icons.
const DASH_IMAGE = {
  t1: aSportsTeamPng,
  t2: aBandMusicPng,
  t3: aPodcastPng,
  t4: aCommunityPng,
  t5: aGamingPng,
  t6: aBrainstormPng,
};

export function SegmentThemeBackdrop({ subId, minimal = false }) {
  const theme = subId ? SEGMENT_THEME[subId] : null;
  const blobStyles = theme?.blobs
    ? {
        '--v4-blob-1-color': theme.blobs[0],
        '--v4-blob-2-color': theme.blobs[1],
        '--v4-blob-3-color': theme.blobs[2],
        '--v4-blob-4-color': theme.blobs[3],
      }
    : undefined;

  // Dashboard (minimal) stages: a soft top glow (recoloured to the segment)
  // + the segment's scattered theme icons. No blobs, no illustration PNGs.
  if (minimal) {
    const base =
      theme?.blobs?.[0] || (subId ? getSegmentTone(subId)?.bg : null) || '#a6dcb3';
    const dashImg = subId ? DASH_IMAGE[subId] : null;
    return (
      <div className="v4-aurora" style={{ '--au-a': base }} aria-hidden="true">
        <span className="v4-aurora-gradient"></span>
        {/* Soft top glow + the faint line-art scene (if any) anchored at
            the very bottom. No scattered decoration. */}
        {dashImg && (
          <img src={dashImg} className="v4-dash-image" alt="" aria-hidden="true" />
        )}
      </div>
    );
  }

  // Chat stages: the full themed backdrop — blobs + scattered icons + the
  // floating illustration PNGs.
  return (
    <>
      {/* Blobs — always rendered. CSS vars override default colors when subId set. */}
      <span className="v4-blob v4-blob-1" style={blobStyles} aria-hidden="true"></span>
      <span className="v4-blob v4-blob-2" style={blobStyles} aria-hidden="true"></span>
      <span className="v4-blob v4-blob-3" style={blobStyles} aria-hidden="true"></span>
      <span className="v4-blob v4-blob-4" style={blobStyles} aria-hidden="true"></span>

      {/* Scattered theme icons */}
      {theme?.iconPositions?.map((pos, i) => {
        const { Icon, size, rotate, ...positionStyle } = pos;
        return (
          <span
            key={`icon-${i}`}
            className="v4-theme-icon"
            style={{
              ...positionStyle,
              '--rot': rotate,
              animationDelay: `${i * 0.18}s, ${i * -2.5}s`,
            }}
            aria-hidden="true"
          >
            <Icon weight="duotone" size={size} />
          </span>
        );
      })}

      {/* Floating illustration PNGs — skipped on dashboard (minimal) stages. */}
      {!minimal && theme?.images?.map((img, i) => {
        const { src, width, opacity, rotate, ...positionStyle } = img;
        return (
          <img
            key={`img-${i}`}
            src={src}
            className="v4-theme-img"
            alt=""
            aria-hidden="true"
            style={{
              ...positionStyle,
              width,
              '--target-opacity': opacity,
              '--rot': rotate,
              animationDelay: `${0.6 + i * 0.4}s, ${i * -3.5}s`,
            }}
          />
        );
      })}
    </>
  );
}
