import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { SEO } from '@/components/SEO';

export function AcceptableUsePolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Acceptable Use Policy"
        description="Sendbase Acceptable Use Policy outlines the rules for using our email delivery service. Learn what's allowed and prohibited."
        canonical="/acceptable-use"
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="p-8 prose prose-sm dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-2">Acceptable Use Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: November 27, 2025</p>

            <Alert className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Violation of this policy may result in immediate suspension or termination of your account without prior notice.
              </AlertDescription>
            </Alert>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Purpose</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using our email delivery service. By using our Service, you agree to comply with this policy. This AUP is designed to protect our infrastructure, maintain our sender reputation, and ensure reliable email delivery for all users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Prohibited Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our Service to send emails containing:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Spam:</strong> Unsolicited bulk email or commercial messages sent without explicit consent</li>
                <li><strong>Malware:</strong> Viruses, trojans, ransomware, or other malicious software</li>
                <li><strong>Phishing:</strong> Fraudulent attempts to obtain sensitive information</li>
                <li><strong>Illegal content:</strong> Content that violates any applicable law or regulation</li>
                <li><strong>Harmful content:</strong> Content promoting violence, hatred, or discrimination</li>
                <li><strong>Adult content:</strong> Pornographic or sexually explicit material (unless properly disclosed)</li>
                <li><strong>Deceptive content:</strong> False or misleading information intended to deceive recipients</li>
                <li><strong>Intellectual property violations:</strong> Content that infringes copyrights, trademarks, or other rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our Service to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Send emails to purchased, rented, or harvested email lists</li>
                <li>Send emails to recipients who have not explicitly opted in</li>
                <li>Send emails with forged, invalid, or misleading headers</li>
                <li>Impersonate another person, company, or entity</li>
                <li>Circumvent or attempt to circumvent sending limits or security measures</li>
                <li>Use the Service to conduct denial-of-service attacks</li>
                <li>Probe, scan, or test vulnerabilities in our systems</li>
                <li>Share API keys or account credentials with unauthorized parties</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Consent Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All recipients must have provided valid consent before you send them emails. Acceptable forms of consent include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Express consent:</strong> The recipient explicitly agreed to receive emails from you</li>
                <li><strong>Transactional relationship:</strong> The email relates to an existing transaction or business relationship</li>
                <li><strong>Double opt-in:</strong> The recipient confirmed their subscription via a confirmation email</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You must maintain records of consent and be able to provide proof upon request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. List Hygiene Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You must maintain clean and accurate email lists by:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Promptly removing bounced email addresses</li>
                <li>Processing unsubscribe requests within 10 business days</li>
                <li>Regularly validating and cleaning your email lists</li>
                <li>Removing inactive subscribers who haven't engaged in 12+ months</li>
                <li>Never reactivating addresses that have previously unsubscribed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Complaint and Bounce Thresholds</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To maintain sending privileges, you must keep the following rates below acceptable thresholds:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Bounce rate:</strong> Must remain below 5%</li>
                <li><strong>Complaint rate:</strong> Must remain below 0.1% (1 complaint per 1,000 emails)</li>
                <li><strong>Spam trap hits:</strong> Zero tolerance for known spam traps</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Exceeding these thresholds may result in automatic throttling or suspension of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Email Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All emails sent through our Service must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Accurately identify the sender in the "From" field</li>
                <li>Include a valid physical mailing address for commercial emails</li>
                <li>Contain a clear and functional unsubscribe mechanism for marketing emails</li>
                <li>Not use deceptive subject lines</li>
                <li>Comply with CAN-SPAM, GDPR, CCPA, and other applicable regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Authentication Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You must properly authenticate your sending domains by:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Completing domain verification through our platform</li>
                <li>Configuring DKIM records as provided</li>
                <li>Setting up SPF records to authorize our servers</li>
                <li>Implementing DMARC policies (recommended)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Monitoring and Enforcement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We actively monitor for policy violations. Our enforcement actions may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Warning notices for minor or first-time violations</li>
                <li>Temporary throttling of sending rates</li>
                <li>Temporary suspension of sending privileges</li>
                <li>Permanent account termination for severe or repeated violations</li>
                <li>Reporting to appropriate authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Reporting Violations</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you receive spam or abusive emails sent through our Service, or become aware of any violations of this policy, please report it to abuse@sendbase.app. Include the full email headers and any relevant information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Policy Updates</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Acceptable Use Policy at any time. Continued use of the Service after changes constitutes acceptance of the updated policy. We will notify users of material changes via email or through the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about this policy, contact us at:
              </p>
              <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
                <li>General inquiries: support@sendbase.app</li>
                <li>Abuse reports: abuse@sendbase.app</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
