// Privacy policy page (route /privacy).
// Generated from the drafts sent to Charles (legal review) on October 1, 2026;
// replace with his reviewed text when it arrives.
import LegalPage from './LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy policy" eyebrow="What we collect" updated="October 8, 2026" decor="warm">
      <p className="legal-lede">This Privacy Policy explains how The Cypher Group, LLC (“Cypher”, “we”, “us” or “our”), operator of NamingContest.com (“NamingContest” or the “Service”), collects, uses, shares and protects personal information when you visit the website or use the Service as a contest host (“Host”), a participant who suggests names or votes (“Participant”), or a visitor.</p>

      <h2>1. Who we are</h2>
      <p>The Service is operated by The Cypher Group, LLC, a limited liability company organised under the laws of the State of California, United States, at 3645 Grand Avenue, Suite 206, Oakland, CA 94610, USA. For the purposes of the EU and UK General Data Protection Regulation (“GDPR”), The Cypher Group, LLC is the controller of the personal data described in this Policy.</p>
      <p>For any privacy question or request, email <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>.</p>

      <h2>2. What we collect</h2>
      <h3>2.1 Information you give us</h3>
      <ul>
      <li><strong>Account details.</strong> Your email address, which we use to sign you in with a one-time link (there are no passwords) and to send you messages about the Service. A display name, and for Hosts a first and last name, which you enter yourself.</li>
      <li><strong>Profile photo.</strong> Optional. Photos are stored at a web address that anyone who has the link can open.</li>
      <li><strong>Contest content (Hosts).</strong> The contest name, your answers to the brief questions, an optional note to participants, prize details, schedule and other settings. Depending on what is being named, answers may describe other people, including children: for example a baby’s expected due date, siblings’ names or a family surname.</li>
      <li><strong>Suggestions and votes (Participants).</strong> The names you suggest, any explanation you add, whether each suggestion is credited to you or shown as anonymous, and the names you vote for.</li>
      <li><strong>Messages to us.</strong> When you use the contact form: your name, email, company (optional), topic and message.</li>
      <li><strong>Payment details (Hosts).</strong> Entered directly into our payment provider’s form (see section 6). We receive only confirmation of payment, the amount and a payment reference.</li>
      </ul>
      <h3>2.2 Information collected automatically</h3>
      <ul>
      <li><strong>Essential browser storage.</strong> To keep you signed in, save unfinished contest drafts and remember your cookie choice. These are needed for the Service to work.</li>
      <li><strong>Analytics, with your consent where required.</strong> Google Analytics (pages viewed, steps completed in contest setup, payments completed, device type and approximate location) and Microsoft Clarity (session recordings of clicks, scrolling and page content, with what you type hidden). See section 5 and our <a href="/cookies">Cookie Policy</a>.</li>
      <li><strong>Cookieless page statistics.</strong> Vercel Web Analytics counts page views, referring sites, country and device type without cookies and without identifying you.</li>
      <li><strong>Anonymous setup step counts.</strong> When anyone moves through contest setup, we count each step reached (for example, the third question of a pet brief), with the tier, category and time. The count holds no identifier, IP address, cookie or answer, and nothing is stored on your device, so it cannot be linked to you.</li>
      <li><strong>Technical data held by our providers.</strong> Our hosting, sign-in and payment providers receive your IP address and browser details when you use the Service. Our sign-in provider keeps the IP address and browser of signed-in sessions in its logs.</li>
      <li><strong>Abuse protection.</strong> For a few public actions (sending a contact message, starting a contest, writing a brief) we keep a one-way, daily-changing code derived from your IP address, and for contest launches from your email address, only to count requests and limit abuse. We do not store raw IP addresses for this.</li>
      <li><strong>Cookie choice records.</strong> When you answer the cookie bar we store an anonymous record: a random identifier kept only in your browser, your answer, the version of the bar, your country and the time. It contains no IP address, email or account.</li>
      </ul>
      <p>We do not use device fingerprinting.</p>

      <h2>3. Information about other people</h2>
      <p>Hosts sometimes describe other people in a brief, such as a partner, a child or a team. Please share only what participants need to suggest good names, and only where you are entitled to share it. Do not include sensitive information such as health details. Participants see the brief, so anything in it will be visible to the people you invite.</p>
      <h2>4. How we use information, and our legal bases</h2>
      <div className="legal-table-wrap">
      <table className="legal-table">
      <thead><tr><th>Purpose</th><th>Legal basis under GDPR</th></tr></thead>
      <tbody>
      <tr><td>Creating your account and signing you in</td><td>Contract</td></tr>
      <tr><td>Running contests: showing the brief, collecting suggestions, counting votes, announcing the winner</td><td>Contract</td></tr>
      <tr><td>Writing the contest brief from the Host’s answers using an AI service (section 5)</td><td>Contract</td></tr>
      <tr><td>Taking payment and keeping payment records</td><td>Contract; legal obligation for tax and accounting records</td></tr>
      <tr><td>Sending service emails: sign-in links, “voting is open”, results, receipts</td><td>Contract</td></tr>
      <tr><td>Answering messages sent through the contact form</td><td>Legitimate interests (responding to enquiries)</td></tr>
      <tr><td>Keeping the Service secure and limiting abuse</td><td>Legitimate interests (security)</td></tr>
      <tr><td>Analytics with Google Analytics and Microsoft Clarity</td><td>Consent in the EEA, UK and Switzerland; elsewhere legitimate interests, with an opt-out</td></tr>
      <tr><td>Cookieless page statistics (Vercel Web Analytics)</td><td>Legitimate interests (understanding overall use)</td></tr>
      <tr><td>Anonymous setup step counts</td><td>Legitimate interests (seeing where contest setup can be made easier)</td></tr>
      <tr><td>Internal reporting from anonymous totals (Looker Studio dashboard)</td><td>Legitimate interests (running and improving the Service)</td></tr>
      <tr><td>Keeping records of cookie choices</td><td>Legal obligation (showing that consent was given)</td></tr>
      </tbody>
      </table>
      </div>
      <p>We do not make decisions about you based solely on automated processing that have legal or similarly significant effects. The AI service drafts the brief text only; the Host reviews it before the contest launches.</p>

      <h2>5. Who we share information with</h2>
      <p>We use the following providers to run the Service. They process information on our behalf under contracts that require them to protect it.</p>
      <div className="legal-table-wrap">
      <table className="legal-table">
      <thead><tr><th>Provider</th><th>What for</th><th>Location</th></tr></thead>
      <tbody>
      <tr><td>Supabase</td><td>Database, file storage, sign-in, server functions</td><td>United States</td></tr>
      <tr><td>Vercel</td><td>Website hosting, country lookup for the cookie bar, cookieless page statistics</td><td>United States; global network</td></tr>
      <tr><td>Stripe</td><td>Payments</td><td>United States; global</td></tr>
      <tr><td>Resend</td><td>Sending email</td><td>United States</td></tr>
      <tr><td>Anthropic</td><td>AI service that drafts the contest brief. Receives the Host’s brief answers, the contest name and the Host’s name unless the Host chose to stay anonymous. No email address or account identifier.</td><td>United States</td></tr>
      <tr><td>Google (Analytics, Tag Manager)</td><td>Analytics, only with consent where required. Advertising features are switched off.</td><td>United States; global</td></tr>
      <tr><td>Google (Looker Studio)</td><td>Internal reporting dashboard for the people who run the Service. It reads only anonymous totals from our database (numbers of contests, payments, revenue, setup steps reached, participants, suggested names and votes, by tier, category and date), never names, email addresses, account identifiers, brief answers or suggested names.</td><td>United States; global</td></tr>
      <tr><td>Microsoft (Clarity)</td><td>Session recordings and heatmaps, only with consent where required. Advertising use is switched off.</td><td>United States; global</td></tr>
      </tbody>
      </table>
      </div>
      <p>Inside the Service:</p>
      <ul>
      <li>Participants see the brief, the Host’s name and photo (unless the Host chose to stay anonymous), and the names suggested, with the suggester’s name where they chose to be credited.</li>
      <li>Hosts see suggestions, credited names, the number of people who joined, and vote totals. Hosts do not see participants’ email addresses or who voted for which name.</li>
      </ul>
      <p>We may also disclose information where required by law, to protect our rights or users’ safety, or as part of a sale or reorganisation of the business. We do not sell personal information.</p>

      <h2>6. Payments</h2>
      <p>Payments are handled by Stripe through a payment form embedded in the Service. Card details go directly to Stripe and never reach our servers. We keep whether a contest is paid, the price and Stripe’s payment reference. Stripe sends the receipt to the Host’s email address. Stripe’s use of your information is described in Stripe’s Privacy Policy.</p>

      <h2>7. Cookies and similar technologies</h2>
      <p>We use essential browser storage to run the Service. Google Analytics and Microsoft Clarity use cookies to measure how the Service is used. Visitors in the European Economic Area, the United Kingdom and Switzerland are asked first, and nothing loads until they accept. Visitors elsewhere have analytics on by default. Anyone can change their choice at any time under “Cookie settings” in the website footer. Details are in our <a href="/cookies">Cookie Policy</a>.</p>

      <h2>8. International transfers</h2>
      <p>The Service is run from the United States and your information is stored there. Where we transfer personal data from the EEA, the UK or Switzerland, we rely on the safeguards our providers offer: the EU-US Data Privacy Framework and its UK and Swiss extensions where a provider is certified, and otherwise the European Commission’s Standard Contractual Clauses and the UK Addendum.</p>
      <h2>9. How long we keep information</h2>
      <ul>
      <li>Account information: while your account exists. You can ask us to delete it at any time (section 10).</li>
      <li>Contests, suggestions and votes: until the Host or the person who submitted them asks us to delete them.</li>
      <li>Payment records: as long as tax and accounting law requires.</li>
      <li>Contact messages: as long as needed to answer and follow up.</li>
      <li>Abuse-protection codes: deleted daily.</li>
      <li>Cookie choice records: as long as needed to show that consent was given.</li>
      <li>Anonymous setup step counts: kept as statistics. They contain no personal information.</li>
      </ul>

      <h2>10. Your rights</h2>
      <p>Depending on where you live, you may have the right to access your personal information, correct it, delete it, receive a copy in a portable format, restrict or object to its use, and withdraw consent at any time without affecting earlier processing. In the EEA, the UK and Switzerland you can also complain to your local data protection authority.</p>
      <p>Residents of California and other US states with privacy laws may have the right to know, access, correct and delete their personal information, and not to be treated differently for using these rights. We do not sell personal information or share it for cross-context behavioural advertising.</p>
      <p>To use any of these rights, email <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a> from the address linked to your account. We may need to confirm your identity first. We will reply within the time the law requires, usually one month.</p>
      <h2>11. Security</h2>
      <p>We use reasonable technical and organisational measures to protect personal information, including encrypted connections, access rules in our database that limit each person to their own data, and limits on how often public actions can be used. No system is completely secure, and we cannot guarantee absolute security.</p>

      <h2>12. Children</h2>
      <p>The Service is not directed to children. The same age rules apply as in our Terms of Service: everyone must be at least 13 years old, or older where local law sets a higher age for agreeing to the use of personal data online, unless a parent or guardian gives permission; Hosts, who pay for contests, must be at least 18 years old, or the age of majority where they live if that is higher; and Participants under 18 need a parent’s or guardian’s permission. We do not knowingly collect personal information from children under 13. If you believe a child has given us personal information, contact us and we will delete it.</p>

      <h2>13. Changes to this Policy</h2>
      <p>We may update this Policy from time to time. The “Last updated” date shows when it last changed. We will tell you about significant changes through the Service or by email.</p>

      <h2>14. Contact</h2>
      <p>NamingContest.com, operated by The Cypher Group, LLC<br />3645 Grand Avenue, Suite 206, Oakland, CA 94610, USA<br />Email: <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a></p>
    </LegalPage>
  );
}
