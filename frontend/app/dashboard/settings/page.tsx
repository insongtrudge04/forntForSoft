'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { authApi } from '../../../lib/api';
import type { ArtistProfile } from '@repo/types';
import { ExternalLink, Save } from 'lucide-react';
import styles from './page.module.css';

interface ArtistMe extends ArtistProfile {
  user: { email: string };
}

export default function DashboardSettingsPage() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<ArtistMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    try {
      const data = await authApi.get<ArtistMe>('/artists/me', token);
      setProfile(data);
    } catch {}
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const token = await getToken();
    if (!token) return;
    try {
      await authApi.patch('/artists/me', token, {
        displayName: profile.displayName,
        bio: profile.bio,
        website: profile.website,
        instagramHandle: profile.instagramHandle,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className={styles.page}><p>Loading...</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Profile Settings</h1>
        <p>Manage your artist profile and account</p>
      </div>
      <div className={styles.sections}>
        <section className={styles.section}>
          <h2>Public Profile</h2>
          <div className={styles.formGrid}>
            <div className="field"><label className="label">Email</label><input className="input" value={profile?.user.email || ''} disabled /></div>
            <div className="field"><label className="label">Display Name</label><input className="input" value={profile?.displayName || ''} onChange={e => setProfile(p => p ? { ...p, displayName: e.target.value } : p)} /></div>
            <div className="field"><label className="label">Bio</label><textarea className="input" rows={4} value={profile?.bio || ''} onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)} style={{ resize: 'vertical' }} /></div>
            <div className="field"><label className="label">Website</label><input className="input" placeholder="https://" value={profile?.website || ''} onChange={e => setProfile(p => p ? { ...p, website: e.target.value } : p)} /></div>
            <div className="field"><label className="label">Instagram</label><input className="input" placeholder="@username" value={profile?.instagramHandle || ''} onChange={e => setProfile(p => p ? { ...p, instagramHandle: e.target.value } : p)} /></div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </section>
        <hr className="divider" />
        <section className={styles.section}>
          <h2>Stripe Payouts</h2>
          <p className={styles.sectionDesc}>Connect your Stripe account to receive payouts from artwork sales directly.</p>
          <button className="btn btn-outline"><ExternalLink size={15} /> Connect Stripe Account</button>
        </section>
      </div>
    </div>
  );
}
