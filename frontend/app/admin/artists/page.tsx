'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PendingArtist {
  id: string;
  displayName: string;
  bio: string | null;
  website: string | null;
  instagramHandle: string | null;
  createdAt: string;
  user: { email: string; clerkId: string };
}

export default function AdminArtistsPage() {
  const { getToken } = useAuth();
  const [artists, setArtists] = useState<PendingArtist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API}/api/admin/artists/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setArtists(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API}/api/admin/artists/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setArtists((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {}
  };

  if (loading) return <div className={styles.page}><p>Loading...</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Artist Applications</h1>
        <p>Review and approve pending artist account requests.</p>
      </div>

      <div className={styles.list}>
        {artists.length === 0 ? (
          <div className={styles.empty}>
            <User size={40} />
            <h3>No Pending Applications</h3>
            <p>There are no artist applications waiting for review.</p>
          </div>
        ) : (
          artists.map((artist) => (
            <div key={artist.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {artist.displayName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.info}>
                  <h3>{artist.displayName}</h3>
                  <p>{artist.user.email}</p>
                  <span className={styles.date}>
                    <Clock size={12} />
                    Applied {new Date(artist.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="badge badge-gold">Pending</span>
              </div>

              {artist.bio && (
                <div className={styles.section}>
                  <strong>Bio</strong>
                  <p>{artist.bio}</p>
                </div>
              )}

              {(artist.website || artist.instagramHandle) && (
                <div className={styles.links}>
                  {artist.website && <span>🌐 {artist.website}</span>}
                  {artist.instagramHandle && <span>📷 {artist.instagramHandle}</span>}
                </div>
              )}

              <div className={styles.actions}>
                <button className="btn btn-primary btn-sm" onClick={() => moderate(artist.id, 'approve')}>
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => moderate(artist.id, 'reject')}>
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
