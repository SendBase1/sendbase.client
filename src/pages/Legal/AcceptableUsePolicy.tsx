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
        description="Sendbase Acceptable Use Policy outlines the rules for using our email processing service. Learn what's allowed and prohibited."
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
                This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using our email processing service. By using our Service, you agree to comply with this policy. This AUP is designed to protect our infrastructure and ensure reliable email processing for all users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Prohibited Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our Service to process emails containing:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Malware:</strong> Viruses, trojans, ransomware, or other malicious software</li>
                <li><strong>Phishing:</strong> Fraudulent attempts to obtain sensitive information</li>
                <li><strong>Illegal content:</strong> Content that violates any applicable law or regulation</li>
                <li><strong>Harmful content:</strong> Content promoting violence, hatred, or discrimination</li>
                <li><strong>Deceptive content:</strong> False or misleading information intended to deceive</li>
                <li><strong>Intellectual property violations:</strong> Content that infringes copyrights, trademarks, or other rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our Service to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Impersonate another person, company, or entity</li>
                <li>Circumvent or attempt to circumvent rate limits or security measures</li>
                <li>Use the Service to conduct denial-of-service attacks</li>
                <li>Probe, scan, or test vulnerabilities in our systems</li>
                <li>Share API keys or account credentials with unauthorized parties</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Process emails from domains you do not own or control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Processing Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When processing emails through our Service, you must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Authorization:</strong> Have proper authorization to receive emails on configured domains</li>
                <li><strong>Privacy compliance:</strong> Handle all email data in compliance with applicable privacy laws</li>
                <li><strong>Data security:</strong> Implement appropriate security measures for processed email data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You are responsible for ensuring your use of processed email data complies with all applicable regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Webhook Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When configuring webhooks to receive processed emails, you must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use secure HTTPS endpoints for all webhook destinations</li>
                <li>Properly validate webhook signatures to prevent unauthorized access</li>
                <li>Respond to webhook deliveries within the timeout period</li>
                <li>Implement appropriate retry handling for failed deliveries</li>
                <li>Maintain webhook endpoints that are consistently available</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Usage Thresholds</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To maintain service access, you must keep the following rates within acceptable thresholds:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Webhook failure rate:</strong> Must remain below 10%</li>
                <li><strong>API error rate:</strong> Excessive errors may trigger rate limiting</li>
                <li><strong>Processing volume:</strong> Must remain within your plan limits</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Exceeding these thresholds may result in automatic throttling or suspension of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Domain Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All domains configured with our Service must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Be owned or controlled by you with proper authorization</li>
                <li>Have DNS records configured as specified in our documentation</li>
                <li>Maintain valid MX records pointing to our service</li>
                <li>Comply with GDPR, CCPA, and other applicable regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Authentication Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You must properly authenticate your domains by:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Completing domain verification through our platform</li>
                <li>Configuring DNS records as provided in our documentation</li>
                <li>Maintaining valid domain ownership throughout use of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Monitoring and Enforcement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We actively monitor for policy violations. Our enforcement actions may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Warning notices for minor or first-time violations</li>
                <li>Temporary throttling of processing rates</li>
                <li>Temporary suspension of service access</li>
                <li>Permanent account termination for severe or repeated violations</li>
                <li>Reporting to appropriate authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Reporting Violations</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you become aware of any violations of this policy or abuse of our Service, please report it to abuse@sendbase.app. Include any relevant information to help us investigate.
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
