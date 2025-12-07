import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { contactApi } from '@/lib/api';

export function ContactPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactApi.submit(formData);
      setIsSuccess(true);
      setFormData({ email: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const contactEmails = [
    { label: 'General inquiries', email: 'support@socialhq.app' },
    { label: 'Report security concerns', email: 'security@socialhq.app' },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-12 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Message sent
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Thanks for reaching out. We'll get back to you within 24 hours.
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              Send another message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-12 -ml-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left column - Heading and contact info */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Get in touch
              </h1>
              <p className="text-lg text-muted-foreground">
                Have a question, feedback, or just want to say hello? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              {contactEmails.map(({ label, email }) => (
                <div key={email} className="group">
                  <p className="text-sm text-muted-foreground mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${email}`}
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {email}
                    </a>
                    <button
                      onClick={() => copyEmail(email)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                      aria-label="Copy email"
                    >
                      {copiedEmail === email ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Right column - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  required
                  className="resize-none bg-muted/50 border-muted-foreground/20 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-medium group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send message
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
