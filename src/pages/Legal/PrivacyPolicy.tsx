import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: November 27, 2025</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email delivery service. We are committed to protecting your privacy and handling your data in an open and transparent manner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium mb-3 mt-6">2.1 Account Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Email address</li>
                <li>Name</li>
                <li>Password (stored securely using industry-standard hashing)</li>
                <li>Organization/company name (if provided)</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 mt-6">2.2 Email Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our Service to send emails, we process:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Sender and recipient email addresses</li>
                <li>Email subject lines</li>
                <li>Email content (for delivery purposes only)</li>
                <li>Delivery status and timestamps</li>
                <li>Bounce and complaint notifications</li>
              </ul>

              <h3 className="text-lg font-medium mb-3 mt-6">2.3 Technical Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>IP addresses</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage logs and analytics</li>
                <li>API access logs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Process and deliver your emails</li>
                <li>Monitor delivery status and provide analytics</li>
                <li>Detect and prevent abuse, fraud, and policy violations</li>
                <li>Communicate with you about your account and the Service</li>
                <li>Comply with legal obligations</li>
                <li>Improve and optimize the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your data as follows:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account data:</strong> Retained while your account is active and for 30 days after deletion</li>
                <li><strong>Email metadata:</strong> Retained for 90 days for delivery tracking and analytics</li>
                <li><strong>Email content:</strong> Not stored after successful delivery processing</li>
                <li><strong>Logs:</strong> Retained for 30 days for security and debugging purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Service providers:</strong> Including Amazon Web Services for email delivery infrastructure</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Protection of rights:</strong> To protect our rights, privacy, safety, or property</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Encryption in transit (TLS/SSL) and at rest</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure API key management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Request a portable copy of your data</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@socialhq.app.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Email: privacy@socialhq.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
