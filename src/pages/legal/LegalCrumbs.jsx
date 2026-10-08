// The Cookie policy page (route /cookies). The FILE is named LegalCrumbs,
// not CookiePolicy, so ad-blockers / Brave Shields don't block the module
// request by name in dev (ERR_BLOCKED_BY_CLIENT → blank page). The
// component, route, and title keep "Cookie" — only the filename is neutral.
//
// Generated from the drafts sent to Charles (legal review) on October 1, 2026;
// replace with his reviewed text when it arrives.
import LegalPage from './LegalPage';
import { openChoiceSettings } from '../../utils/visitorChoice';

export default function CookiePolicy() {
  const openSettings = (e) => { e.preventDefault(); openChoiceSettings(); };
  return (
    <LegalPage title="Cookie policy" eyebrow="What we store" updated="October 1, 2026" decor="fresh">
      <p className="legal-lede">This Cookie Policy explains how NamingContest.com, operated by The Cypher Group, LLC (“we”, “us”), uses cookies and similar technologies, and how you can control them. It sits alongside our <a href="/privacy">Privacy Policy</a>, which explains how we handle personal information more broadly.</p>

      <h2>1. What cookies and similar technologies are</h2>
      <p>Cookies are small text files a website stores in your browser. Similar technologies include the browser’s local storage and session storage. In this policy “cookies” covers all of them.</p>

      <h2>2. Cookies we use</h2>
      <h3>Essential</h3>
      <p>These are needed for the website to work, so they do not need your consent.</p>
      <div className="legal-table-wrap">
      <table className="legal-table">
      <thead><tr><th>Name</th><th>Provider</th><th>What it does</th><th>How long</th></tr></thead>
      <tbody>
      <tr><td>sb-…-auth-token (local storage)</td><td>NamingContest (Supabase)</td><td>Keeps you signed in</td><td>Until you sign out</td></tr>
      <tr><td>v4_… (local storage)</td><td>NamingContest</td><td>Saves an unfinished contest setup and your progress through a contest</td><td>Until cleared</td></tr>
      <tr><td>nc_choice (local storage)</td><td>NamingContest</td><td>Remembers your cookie choice</td><td>Until cleared, or until we ask again</td></tr>
      <tr><td>nc_region (session storage)</td><td>NamingContest</td><td>Remembers which country rules apply during this visit</td><td>Until you close the tab</td></tr>
      <tr><td>__stripe_mid, __stripe_sid</td><td>Stripe</td><td>Fraud prevention on the payment form</td><td>Up to 1 year, and 30 minutes</td></tr>
      </tbody>
      </table>
      </div>
      <h3>Analytics</h3>
      <p>These help us understand how the website is used so we can improve it. Where the law requires it, they are only used with your consent.</p>
      <div className="legal-table-wrap">
      <table className="legal-table">
      <thead><tr><th>Name</th><th>Provider</th><th>What it does</th><th>How long</th></tr></thead>
      <tbody>
      <tr><td>_ga, _ga_LLNFFFZGQH</td><td>Google Analytics</td><td>Recognises a returning browser to count visits and the steps people complete</td><td>Up to 2 years</td></tr>
      <tr><td>_clck, _clsk</td><td>Microsoft Clarity</td><td>Links page views into one session for recordings and heatmaps of clicks and scrolling. What you type is hidden.</td><td>Up to 1 year, and 1 day</td></tr>
      </tbody>
      </table>
      </div>
      <p>Google Analytics and Microsoft Clarity are loaded through Google Tag Manager, which itself sets no cookies. Their advertising features are switched off. We also use Vercel Web Analytics, which counts page views without cookies and without identifying you.</p>
      <h2>3. How we ask for your choice</h2>
      <ul>
      <li><strong>European Economic Area, United Kingdom and Switzerland:</strong> a bar asks before any analytics cookie is used, with equal “Reject all” and “Accept all” buttons. Until you accept, analytics tools are not loaded at all. We find your country from your IP address. If it cannot be found, we ask.</li>
      <li><strong>Everywhere else:</strong> analytics cookies are on by default, and you can turn them off at any time.</li>
      </ul>
      <p>We keep an anonymous record of each answer to the bar (a random identifier stored only in your browser, your answer, the version of the bar, your country and the time) so we can show that consent was given.</p>

      <h2>4. Changing your mind</h2>
      <p>Choose <a href="#cookie-settings" onClick={openSettings}>Cookie settings</a> in the footer of the website at any time to see your current choice and change it. If you turn analytics off, we delete the analytics cookies on our website and stop the tools straight away. You can also delete cookies or block them in your browser settings, though blocking essential ones may stop the website from working.</p>

      <h2>5. Changes to this policy</h2>
      <p>If we add new tools or uses, such as advertising, we will update this policy and ask for your choice again where the law requires.</p>

      <h2>6. Contact</h2>
      <p>Questions about cookies: <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>. More about how we handle personal information is in our <a href="/privacy">Privacy Policy</a>.</p>
    </LegalPage>
  );
}
