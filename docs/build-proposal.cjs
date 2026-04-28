const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "1E2330", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 18 })] })],
  });
}

function cell(text, width, opts = {}) {
  const runs = [];
  if (opts.bold) {
    runs.push(new TextRun({ text, bold: true, font: "Arial", size: 18 }));
  } else {
    runs.push(new TextRun({ text, font: "Arial", size: 18 }));
  }
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: runs })],
  });
}

const COL_WIDTHS = [600, 2100, 2760, 900, 1000, 1000, 1000];
const TABLE_WIDTH = COL_WIDTHS.reduce((a, b) => a + b, 0);

const roadmapRows = [
  ["1", "Homepage Design", "Finalize layout and visual direction from your feedback. Becomes the design template for all pages. 1\u20132 revision rounds.", "10\u201314 hrs", "1\u20131.5 weeks", "$300\u2013420", "Yes"],
  ["2", "Homepage Copy", "Headlines, CTAs, social proof, segment previews, value propositions", "6\u20138 hrs", "0.5\u20131 week", "$180\u2013240", "Yes"],
  ["3", "Inner Pages Design + Mobile", "Apply homepage design language across all screens \u2014 brief builder, contest live, voting, results, dashboard, documentation, all segment variations. Mobile-responsive.", "25\u201335 hrs", "2.5\u20133.5 weeks", "$750\u20131,050", "Yes"],
  ["4", "Inner Pages Copy & Content", "UI microcopy, onboarding text, educational articles, brief builder guidance", "10\u201314 hrs", "1\u20131.5 weeks", "$300\u2013420", "Yes"],
  ["5", "Backend & Auth", "Supabase \u2014 database for users, contests, submissions, votes. Email login, row-level security, real-time vote updates.", "25\u201335 hrs", "2.5\u20133.5 weeks", "$750\u20131,050", "Yes"],
  ["6", "Email & Invite System", "Shareable contest links with join flow. Email template design and copywriting for: invitations, deadline reminders, winner announcements, post-contest follow-ups.", "12\u201316 hrs", "1\u20132 weeks", "$360\u2013480", "Yes"],
  ["7", "Payment Processing", "Stripe checkout for $9/$29/$89 tiers, webhook-based feature unlocking, discount codes", "12\u201316 hrs", "1\u20132 weeks", "$360\u2013480", "Yes"],
  ["8", "Affiliate Link Integration", "Connect affiliate networks (Namecheap, LegalZoom, Looka, Squarespace, etc.), click tracking, conversion attribution", "10\u201314 hrs", "1\u20131.5 weeks", "$300\u2013420", "Can defer*"],
  ["9", "PDF Generation", "Contest result reports and naming certificates (branded + white-label)", "8\u201312 hrs", "1\u20131.5 weeks", "$240\u2013360", "Yes"],
  ["10", "Analytics & Tracking", "GA4, Meta Pixel, PostHog for funnel analysis, paywall conversion, feature adoption", "6\u201310 hrs", "0.5\u20131 week", "$180\u2013300", "Yes"],
  ["11", "Domain & Deployment", "Production domain, SSL, staging/production environments, Vercel edge caching", "4\u20136 hrs", "2\u20133 days", "$120\u2013180", "Yes"],
  ["12", "Security & Monitoring", "Sentry error tracking, uptime monitoring, pre-launch security review \u2014 input sanitization, database policies, Stripe webhook verification, rate limiting", "8\u201312 hrs", "1\u20131.5 weeks", "$240\u2013360", "Yes"],
];

function makeRow(data, shading) {
  return new TableRow({
    children: data.map((text, i) => cell(text, COL_WIDTHS[i], { shading, bold: i === 0 || i === 1 })),
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, font: "Arial" })] });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
  });
}

function bulletItem(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1E2330" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1E2330" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "NamingContest SaaS \u2014 Development Proposal", font: "Arial", size: 16, color: "888888", italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", font: "Arial", size: 16, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "888888" })],
        })],
      }),
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "NamingContest SaaS", font: "Arial", size: 40, bold: true, color: "1E2330" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Development Proposal & Roadmap", font: "Arial", size: 28, color: "555555" })],
      }),

      // Intro
      bodyText("Hey Mark and Maria,"),
      emptyLine(),
      bodyText("Thank you both so much for the kind words \u2014 genuinely made my day. But I want to flip the credit: the reason everything connects so well is because the idea itself is brilliant. You identified a real gap \u2014 there\u2019s nothing between \u201Ctype a keyword into an AI name generator\u201D and \u201C$50,000+ agency naming engagements.\u201D A structured naming contest platform with real methodology? That doesn\u2019t exist yet. I just translated your vision into screens."),
      bodyText("Maria \u2014 the fact that you noticed depth in the affiliate strategy and segment-specific content tells me you see the full business picture, not just a website. That\u2019s exactly why this project has legs."),

      // Why This Approach Works
      heading("Why This Approach Works"),
      bodyText("Before I lay out the roadmap, I want to explain why I think this setup makes sense for a project like this \u2014 and why it saves you real money."),
      bodyText("Typically, building a SaaS product requires hiring separately: a UI/UX designer to create the interface, a copywriter who understands naming and branding to write the content, and a developer to build it all. That\u2019s 3 different people (or an agency coordinating them), each billing independently, each needing to be briefed on the product vision, each requiring back-and-forth with you. That\u2019s how projects hit $30,000\u2013$80,000."),
      bodyText("With me, you get the creative direction, the naming/branding domain knowledge, the UI design, the copywriting, and the development \u2014 all from one person working with AI-assisted coding tools. One point of contact who already understands the product inside out. That\u2019s why we can target a fraction of the typical cost without cutting corners on quality."),
      bodyText("The trade-off: I\u2019m not a senior backend engineer. For the most complex technical work \u2014 most likely the last three stages (analytics, deployment, security) \u2014 I\u2019ll bring in a specialized developer via Upwork to handle those pieces properly. It could also happen earlier if I hit something unexpected during payment integration or real-time features. When the dev works, you pay their rate ($50\u2013$70/hr) and I don\u2019t charge anything for those hours. When I work, I charge based on our agreed hourly rate. You\u2019re never double-paying."),
      bodyText("The result: you get a product built by someone who thinks about naming strategy, user psychology, and affiliate revenue \u2014 not just code \u2014 at a price point that makes sense for where this project is right now."),

      // Where We Are
      heading("Where We Are"),
      bodyText("The prototype covers the complete user experience \u2014 all contest segments, quality scoring, voting flows, affiliate placements, paywall logic, and educational content. That\u2019s the UX and product logic \u2014 done."),
      bodyText("What\u2019s left is turning this into a functioning SaaS. You can review the full technical scope in the \u201CProject Roadmap\u201D section of the documentation. Here\u2019s how I\u2019d break it into stages:"),

      // Roadmap table
      heading("Proposed Development Roadmap"),
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: COL_WIDTHS,
        rows: [
          new TableRow({
            children: ["#", "Stage", "What\u2019s Included", "Est. Hours", "Timeline", "Cost (@$30/hr)", "Required?"]
              .map((t, i) => headerCell(t, COL_WIDTHS[i])),
          }),
          ...roadmapRows.map((row, i) => makeRow(row, i % 2 === 0 ? "F5F7FA" : undefined)),
        ],
      }),

      emptyLine(),
      bodyText("*Stage 8 \u2014 Affiliate Links can be deferred: most affiliate programs require existing traffic before they approve applications. Better to launch, build a user base, then apply once you have numbers to show. The placeholder structure is already in the wireframe \u2014 we wire in real links later.", { italics: true, size: 20 }),

      // Totals
      heading("Project Totals"),
      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: "Launch-critical (Stages 1\u20137, 9\u201312): ", bold: true, font: "Arial", size: 22 }),
        new TextRun({ text: "126\u2013178 hours / 14\u201319 weeks / $3,780\u2013$5,340", font: "Arial", size: 22 }),
      ]}),
      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: "Full scope including affiliates: ", bold: true, font: "Arial", size: 22 }),
        new TextRun({ text: "136\u2013192 hours / 15.5\u201321 weeks / $4,080\u2013$5,760", font: "Arial", size: 22 }),
      ]}),
      emptyLine(),
      bodyText("Timeline assumes part-time schedule. Stages requiring your feedback (especially 1\u20134) depend on your turnaround speed \u2014 faster feedback = faster progress.", { italics: true }),

      // Context on Cost
      heading("For Context On Cost"),
      bodyText("A SaaS of this complexity typically costs $30,000\u2013$80,000 through a dev agency, or $15,000\u2013$40,000 with a traditional freelancer. We\u2019re targeting $3,780\u2013$5,340 for launch by using AI-assisted development and cutting agency overhead."),
      bodyText("Keeping costs this low requires a practical mindset on both sides:"),
      bulletItem("Design will be clean and professional, not pixel-perfect. Iterating on small visual details is where hours balloon. We refine post-launch based on real user feedback."),
      bulletItem("Copy will be solid, not award-winning. Effective messaging throughout, with room to elevate later."),
      bulletItem("Progress over perfection. A polished, functional product \u2014 not three rounds on a button color."),

      // Billing
      heading("How Billing Works"),
      bodyText("Billing is stage-by-stage, invoiced monthly for completed work. After each stage I send a progress report with exactly what was built and hours spent. You review, we align, move forward. No surprises, no large upfront commitments."),

      // Next Step
      heading("Immediate Next Step"),
      bodyText("Before moving into the final build stage, let\u2019s do 1\u20132 more homepage wireframe revisions based on your detailed feedback. Once we\u2019re aligned on the homepage direction, that locks in the visual DNA and we move straight into the production roadmap above."),
      emptyLine(),
      bodyText("Looking forward to your thoughts."),
      emptyLine(),
      bodyText("Best,"),
      bodyText("Matt", { bold: true }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\ITWORK\\Downloads\\COMPLETE-FINAL\\docs\\NamingContest-SaaS-Development-Proposal.docx", buffer);
  console.log("Done! Saved to docs/NamingContest-SaaS-Development-Proposal.docx");
});
