'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Palette, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

type ApplicationStatus = { hasApplied: boolean; status?: string; profile?: unknown } | null;

export default function BecomeArtistPage() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [appStatus, setAppStatus] = useState<ApplicationStatus>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const check = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await authApi.get('/artists/my-status', token);
        setAppStatus(data as ApplicationStatus);
      } catch {}
    };
    check();
  }, [isSignedIn, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await authApi.post('/artists/apply', token, { displayName, bio, website, instagramHandle: instagram });
      setAppStatus({ hasApplied: true, status: 'pending' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold">Become an Artist</h1>
          <p className="text-text-muted">Sign in to apply for an artist account.</p>
        </Card>
      </div>
    );
  }

  if (appStatus?.hasApplied && appStatus?.status === 'pending') {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <Clock size={48} className="text-text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">Application Pending</h1>
          <p className="text-text-muted">Your artist application is under review. We&apos;ll notify you once it&apos;s approved.</p>
        </Card>
      </div>
    );
  }

  if (appStatus?.hasApplied && appStatus?.status === 'approved') {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <CheckCircle size={48} className="text-success" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">You&apos;re an Artist!</h1>
          <p className="mb-6 text-text-muted">Your artist account is active. Start listing your artworks on the dashboard.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (appStatus?.hasApplied && appStatus?.status === 'rejected') {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <AlertCircle size={48} className="text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">Application Rejected</h1>
          <p className="mb-6 text-text-muted">Your application was not approved. Contact support for more information.</p>
          <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-6 text-center">
          <Palette size={32} className="mx-auto mb-3 text-text-primary" />
          <h1 className="mb-1 text-2xl font-semibold">Become an Artist</h1>
          <p className="text-sm text-text-muted">Fill out the form below to apply for an artist account. An admin will review your application.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your artist name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your art"
              rows={4}
              className="flex w-full rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
