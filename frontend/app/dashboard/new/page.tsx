'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { authApi } from '../../../lib/api';
import { Upload, X, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import styles from './page.module.css';

const STEPS = ['Basic Info', 'Pricing & Edition', 'Upload Images', 'Review & Publish'];
const MEDIUM_OPTIONS = ['Painting', 'Sculpture', 'Photography', 'Print', 'Digital', 'Drawing', 'Mixed_Media'];

interface FormData {
  title: string;
  description: string;
  medium: string;
  yearCreated: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  price: number | null;
  editionType: string;
  editionNumber: number | null;
  editionTotal: number | null;
  images: string[];
  imageFiles: File[];
}

export default function NewArtworkPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    title: '', description: '', medium: '', yearCreated: null, width: null, height: null, depth: null,
    price: null, editionType: 'unique', editionNumber: null, editionTotal: null,
    images: [], imageFiles: [],
  });

  const update = (field: keyof FormData, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleImageUpload = async () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) { setError('Cloudinary not configured'); return; }
    setSubmitting(true);
    const urls: string[] = [];
    for (const file of form.imageFiles) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: data });
      const json = await res.json();
      if (json.secure_url) urls.push(json.secure_url);
    }
    update('images', [...form.images, ...urls]);
    update('imageFiles', []);
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    const token = await getToken();
    if (!token) { setError('Not authenticated'); setSubmitting(false); return; }
    try {
      await authApi.post('/artworks', token, {
        title: form.title,
        description: form.description,
        medium: form.medium.replace(' ', '_'),
        yearCreated: form.yearCreated,
        width: form.width,
        height: form.height,
        depth: form.depth,
        price: Number(form.price),
        editionType: form.editionType,
        editionNumber: form.editionNumber ? Number(form.editionNumber) : undefined,
        editionTotal: form.editionTotal ? Number(form.editionTotal) : undefined,
        imageUrls: form.images,
      });
      router.push('/dashboard/listings');
    } catch (e: any) {
      setError(e.message || 'Failed to publish artwork');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>List New Artwork</h1>
        <p>Complete all steps to publish your artwork</p>
      </div>

      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={styles.stepItem}>
            <div className={`${styles.stepDot} ${i < step ? styles.done : i === step ? styles.current : ''}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`${styles.stepLabel} ${i === step ? styles.stepActive : ''}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formCard}>
        {step === 0 && (
          <div className={styles.formGrid}>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label className="label">Artwork Title *</label>
              <input className="input" placeholder="e.g. Untitled No. 7" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label className="label">Description</label>
              <textarea className="input" rows={4} placeholder="Tell the story of this piece" value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="field">
              <label className="label">Medium *</label>
              <select className="input" value={form.medium} onChange={e => update('medium', e.target.value)}>
                <option value="">Select medium</option>
                {MEDIUM_OPTIONS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Year Created</label>
              <input className="input" type="number" placeholder="2024" value={form.yearCreated ?? ''} onChange={e => update('yearCreated', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="field"><label className="label">Width (cm)</label><input className="input" type="number" placeholder="80" value={form.width ?? ''} onChange={e => update('width', e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="field"><label className="label">Height (cm)</label><input className="input" type="number" placeholder="60" value={form.height ?? ''} onChange={e => update('height', e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="field"><label className="label">Depth (cm)</label><input className="input" type="number" placeholder="2" value={form.depth ?? ''} onChange={e => update('depth', e.target.value ? Number(e.target.value) : null)} /></div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.formGrid}>
            <div className="field">
              <label className="label">Price (USD) *</label>
              <input className="input" type="number" placeholder="e.g. 1200" value={form.price ?? ''} onChange={e => update('price', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="field">
              <label className="label">Edition Type *</label>
              <div className={styles.editionCards}>
                {[
                  { value: 'unique', label: 'Unique', desc: 'One of a kind' },
                  { value: 'limited', label: 'Limited Edition', desc: 'Fixed number of prints' },
                  { value: 'open', label: 'Open Edition', desc: 'Unlimited prints available' },
                ].map(e => (
                  <label key={e.value} className={styles.editionCard}>
                    <input type="radio" name="edition" value={e.value} checked={form.editionType === e.value} onChange={() => update('editionType', e.value)} />
                    <div><strong>{e.label}</strong><p>{e.desc}</p></div>
                  </label>
                ))}
              </div>
            </div>
            {form.editionType === 'limited' && (
              <>
                <div className="field"><label className="label">Edition Number</label><input className="input" type="number" placeholder="e.g. 1" value={form.editionNumber ?? ''} onChange={e => update('editionNumber', e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="field"><label className="label">Total in Edition</label><input className="input" type="number" placeholder="e.g. 50" value={form.editionTotal ?? ''} onChange={e => update('editionTotal', e.target.value ? Number(e.target.value) : null)} /></div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className={styles.imageStep}>
            <div className={styles.dropzone} onClick={() => document.getElementById('file-input')?.click()}>
              <Upload size={32} color="var(--color-text-muted)" />
              <p>Click to select up to 8 images</p>
              <span>JPG, PNG, WebP · Max 20MB each</span>
              <button className="btn btn-outline btn-sm" type="button">Browse Files</button>
            </div>
            <input id="file-input" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => {
              const files = Array.from(e.target.files || []);
              update('imageFiles', files);
              handleImageUpload();
              e.target.value = '';
            }} />
            {form.images.length > 0 && (
              <div className={styles.previewGrid}>
                {form.images.map((url, i) => (
                  <div key={i} className={styles.preview}>
                    <img src={url} alt="" />
                    <button className={styles.removeBtn} onClick={() => update('images', form.images.filter((_, j) => j !== i))}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {submitting && <div className={styles.uploading}><Loader2 size={16} className={styles.spin} /> Uploading...</div>}
            <p className={styles.imageHint}>First image will be used as the cover.</p>
          </div>
        )}

        {step === 3 && (
          <div className={styles.review}>
            <h3>Ready to publish?</h3>
            {form.title && <div className={styles.reviewItem}><Check size={16} color="var(--color-success)" /><span>Title: {form.title}</span></div>}
            {form.description && <div className={styles.reviewItem}><Check size={16} color="var(--color-success)" /><span>Description provided</span></div>}
            {form.medium && <div className={styles.reviewItem}><Check size={16} color="var(--color-success)" /><span>Medium: {form.medium.replace('_', ' ')}</span></div>}
            {form.price && <div className={styles.reviewItem}><Check size={16} color="var(--color-success)" /><span>Price: ${form.price.toLocaleString()}</span></div>}
            {form.images.length > 0 && <div className={styles.reviewItem}><Check size={16} color="var(--color-success)" /><span>{form.images.length} image(s) uploaded</span></div>}
          </div>
        )}

        <div className={styles.formActions}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-outline" disabled={submitting}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={submitting}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={submitting}>
              {submitting ? <><Loader2 size={16} className={styles.spin} /> Publishing...</> : <><Check size={16} /> Publish Artwork</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
