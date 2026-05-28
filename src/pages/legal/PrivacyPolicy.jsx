import LegalPage from './LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy policy" updated="May 28, 2026">
      <p className="legal-lede">
        This Privacy Policy explains how The Cypher Group, LLC
        (&ldquo;Cypher,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;), operator of NamingContest.com
        (&ldquo;NamingContest&rdquo; or the &ldquo;Service&rdquo;),
        collects, uses, discloses, and safeguards your personal
        information when you access or use the Service. By using the
        Service, you agree to the practices described in this Policy.
      </p>

      <h2>1. Who we are</h2>
      <p>
        The Service is operated by The Cypher Group, LLC, a limited
        liability company organized under the laws of the State of
        California, United States, located at 3645 Grand Avenue, Suite
        206, Oakland, CA 94610, USA.
      </p>
      <p>
        For any privacy-related request or question, contact us at{' '}
        <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>.
        For the purposes of the EU and UK General Data Protection
        Regulation (&ldquo;GDPR&rdquo;), The Cypher Group, LLC is the
        data controller of the personal data processed through the
        Service.
      </p>

      <h2>2. Information we collect</h2>
      <p>We collect the following categories of personal information:</p>
      <h3>2.1 Information you provide</h3>
      <ul>
        <li>
          <span className="legal-defn">Account and contact data:</span>{' '}
          your email address, which is used to authenticate you via a
          passwordless &ldquo;magic link&rdquo; and to send you
          Service-related communications; and a display name, which may
          be entered by you or derived from your email address.
        </li>
        <li>
          <span className="legal-defn">Profile data:</span> an optional
          profile image, if you choose to upload one.
        </li>
        <li>
          <span className="legal-defn">Contest content (creators):</span>{' '}
          the working name, brief responses, settings, and other
          information you submit when creating and managing a contest.
        </li>
        <li>
          <span className="legal-defn">Submission content
          (participants):</span> the names you propose, together with
          any accompanying explanation of their meaning and rationale,
          and the votes you cast.
        </li>
      </ul>
      <h3>2.2 Information collected automatically</h3>
      <ul>
        <li>
          <span className="legal-defn">Aggregate usage data:</span> via
          Vercel Web Analytics, we measure aggregate, non-identifying
          metrics such as page views and site performance. This tool
          does not set cookies, does not store data on your device, and
          does not track you across sessions or websites. See our{' '}
          <a href="/cookies">Cookie Policy</a> for details.
        </li>
        <li>
          <span className="legal-defn">Authentication session:</span> a
          session token is stored in your browser by our authentication
          provider to keep you signed in. This is strictly necessary to
          provide the Service.
        </li>
      </ul>
      <p>
        We do not use advertising, marketing, or
        behavioral-tracking technologies, and we do not sell or share
        your personal information for cross-context behavioral
        advertising.
      </p>
      <h3>2.3 How participants are invited</h3>
      <p>
        Contest creators invite others to participate by sharing a link.
        We do not collect or store invitee email lists from creators. A
        participant&rsquo;s email address is collected only if and when
        that participant chooses to join a contest using a shared link.
      </p>

      <h2>3. How we use your information</h2>
      <p>We process personal information for the following purposes:</p>
      <ul>
        <li>to create and authenticate your account and keep you signed in;</li>
        <li>to operate the Service, including hosting contests, collecting submissions, and tabulating votes;</li>
        <li>to send transactional and Service-related emails, such as magic-link sign-in links, contest invitations you initiate, notifications when a contest enters its voting stage, and winner announcements;</li>
        <li>to process payments for contest fees;</li>
        <li>to maintain the security, integrity, and proper functioning of the Service;</li>
        <li>to comply with legal obligations and enforce our Terms of Service.</li>
      </ul>

      <h2>4. Legal bases for processing (EU/UK users)</h2>
      <p>
        Where the GDPR applies, we rely on the following legal bases:
      </p>
      <ul>
        <li><span className="legal-defn">Performance of a contract</span> — to provide the Service you have requested, including account creation, contest operation, and payment processing;</li>
        <li><span className="legal-defn">Legitimate interests</span> — to secure, maintain, and improve the Service and to understand aggregate usage, provided such interests are not overridden by your rights;</li>
        <li><span className="legal-defn">Legal obligation</span> — to retain records and respond to lawful requests;</li>
        <li><span className="legal-defn">Consent</span> — where specifically requested; you may withdraw consent at any time.</li>
      </ul>

      <h2>5. Service providers and sub-processors</h2>
      <p>
        We share personal information with the following third-party
        service providers, who process data on our behalf and under
        contractual obligations to protect it:
      </p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Data location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>Database hosting and user authentication; storage of account, contest, submission, and voting data</td>
              <td>United States (California)</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Payment processing for contest fees</td>
              <td>United States; global</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Delivery of transactional and Service-related email</td>
              <td>United States</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Application hosting and privacy-preserving, cookieless aggregate analytics</td>
              <td>United States; global edge network</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Your contest, account, submission, and voting data are stored in
        our database hosted by Supabase. We do not sell your personal
        information to any third party.
      </p>

      <h2>6. Payments</h2>
      <p>
        Payments are processed by Stripe. We do not collect or store
        your full payment card details on our systems; card data is
        transmitted directly to and handled by Stripe in accordance with
        applicable payment card industry standards. Stripe&rsquo;s
        processing of your payment information is governed by{' '}
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&rsquo;s Privacy Policy</a>.
      </p>

      <h2>7. International transfers</h2>
      <p>
        The Service is operated from, and your information is stored in,
        the United States. If you access the Service from outside the
        United States, you understand that your personal information
        will be transferred to and processed in the United States and
        other jurisdictions where our service providers operate. Where
        required by law, such transfers are made pursuant to appropriate
        safeguards, including the European Commission&rsquo;s Standard
        Contractual Clauses or equivalent mechanisms offered by our
        service providers.
      </p>

      <h2>8. Data retention</h2>
      <p>
        We retain personal information for as long as your account
        remains active and for up to twenty-four (24) months following
        your last activity, after which it is deleted or anonymized,
        unless a longer retention period is required to comply with our
        legal obligations, resolve disputes, or enforce our agreements.
        Payment and transaction records may be retained by our payment
        processor for up to seven (7) years to satisfy tax and
        accounting obligations. You may request deletion of your
        contest content at any time, as described below.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Subject to applicable law, you may have the right to access,
        correct, update, delete, restrict, or object to our processing
        of your personal information; to data portability; and to lodge
        a complaint with a supervisory authority. Residents of the
        European Economic Area and the United Kingdom have these rights
        under the GDPR. Residents of California have rights under the
        California Consumer Privacy Act, as amended (&ldquo;CCPA&rdquo;),
        including the rights to know, delete, and correct, and the right
        not to be discriminated against for exercising those rights; we
        do not sell or share personal information as those terms are
        defined under the CCPA.
      </p>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>.
        We will respond within the timeframes required by applicable law.
      </p>

      <h2>10. Security</h2>
      <p>
        We implement reasonable administrative, technical, and
        organizational measures designed to protect personal information
        against unauthorized access, loss, misuse, or alteration.
        However, no method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>11. Children&rsquo;s privacy</h2>
      <p>
        The Service is not directed to children under the age of 13, and
        we do not knowingly collect personal information from children
        under 13. Where you reside in a jurisdiction that sets a higher
        age of digital consent, you must meet that age or have the
        consent of a parent or legal guardian to use the Service. If you
        believe a child has provided us with personal information,
        please contact us and we will take steps to delete it.
      </p>

      <h2>12. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The
        &ldquo;Last updated&rdquo; date at the top of this page indicates
        when it was last revised. Material changes will be communicated
        through the Service or by email where appropriate. Your continued
        use of the Service after the effective date constitutes
        acceptance of the revised Policy.
      </p>

      <h2>13. Contact us</h2>
      <p>
        NamingContest.com, operated by The Cypher Group, LLC<br />
        3645 Grand Avenue, Suite 206, Oakland, CA 94610, USA<br />
        Email:{' '}
        <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>
      </p>
    </LegalPage>
  );
}
