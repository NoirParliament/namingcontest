import LegalPage from './LegalPage';

export default function CookiePolicy() {
  return (
    <LegalPage title="Cookie Policy" updated="May 28, 2026">
      <p className="legal-lede">
        This Cookie Policy explains how NamingContest.com
        (&ldquo;NamingContest,&rdquo; the &ldquo;Service&rdquo;),
        operated by The Cypher Group, LLC (&ldquo;Cypher,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), uses
        cookies and similar technologies. It should be read together
        with our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. Summary</h2>
      <p>
        We use only what is strictly necessary to operate the Service.
        We do not use advertising cookies, marketing
        pixels, or behavioral-tracking technologies, and we do not sell
        or share information about you for advertising. Because we do not
        set non-essential cookies, the Service does not display a cookie
        consent banner. Your user, contest, submission, and voting data
        are stored in our database (hosted by Supabase), not in cookies
        on your device.
      </p>

      <h2>2. What cookies and similar technologies are</h2>
      <p>
        Cookies are small text files placed on your device by a website.
        &ldquo;Similar technologies&rdquo; include browser storage
        mechanisms such as local storage and session storage. Some are
        strictly necessary for a site to function; others are optional.
        We use only strictly necessary technologies, described below.
      </p>

      <h2>3. Technologies we use</h2>

      <h3>3.1 Authentication session (strictly necessary)</h3>
      <p>
        When you sign in using our passwordless &ldquo;magic link,&rdquo;
        our authentication provider (Supabase) stores a session token in
        your browser to keep you signed in across pages. This is
        strictly necessary to provide the Service and cannot be disabled
        while you remain signed in. Signing out, or clearing your
        browser storage, removes it.
      </p>

      <h3>3.2 Payment processing (strictly necessary)</h3>
      <p>
        When you make a payment, our payment processor, Stripe, sets
        cookies on your device to process the transaction securely and
        to help detect and prevent fraud. These cookies are set and
        controlled by Stripe in its capacity as payment processor. For
        details, see{' '}
        <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">Stripe&rsquo;s Cookie Policy</a>.
      </p>

      <h3>3.3 Aggregate analytics (cookieless)</h3>
      <p>
        We use Vercel Web Analytics to understand aggregate site usage
        and performance. This tool is privacy-preserving and{' '}
        does not set cookies, does not store data on
        your device, and does not track you across sessions or websites.
        It counts unique visitors using a short-lived, server-side hash
        that is not used to identify you and is discarded. Visitors who
        enable a &ldquo;Do Not Track&rdquo; browser signal are not
        measured.
      </p>

      <h2>4. Summary table</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr>
              <th>Technology</th>
              <th>Set by</th>
              <th>Purpose</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Authentication session token</td>
              <td>Supabase (on our behalf)</td>
              <td>Keep you signed in</td>
              <td>Strictly necessary</td>
            </tr>
            <tr>
              <td>Payment &amp; fraud-prevention cookies</td>
              <td>Stripe</td>
              <td>Process payments securely</td>
              <td>Strictly necessary</td>
            </tr>
            <tr>
              <td>Aggregate analytics</td>
              <td>Vercel</td>
              <td>Measure aggregate usage &amp; performance</td>
              <td>Cookieless — no device storage</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>5. Managing cookies and browser storage</h2>
      <p>
        Because we use only strictly necessary technologies, disabling
        them may prevent the Service from functioning correctly (for
        example, you may be unable to stay signed in or complete a
        payment). You can nevertheless control or clear cookies and
        browser storage through your browser settings, and you can sign
        out at any time to remove your authentication session.
      </p>

      <h2>6. Changes to this Policy</h2>
      <p>
        We may update this Cookie Policy from time to time, including if
        we introduce new technologies. The &ldquo;Last updated&rdquo;
        date at the top of this page indicates when it was last revised.
        If we ever introduce non-essential cookies or tracking
        technologies, we will update this Policy and implement an
        appropriate consent mechanism before doing so.
      </p>

      <h2>7. Contact us</h2>
      <p>
        NamingContest.com, operated by The Cypher Group, LLC<br />
        3645 Grand Avenue, Suite 206, Oakland, CA 94610, USA<br />
        Email:{' '}
        <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>
      </p>
    </LegalPage>
  );
}
