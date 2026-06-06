'use client';

import { useUser } from '@clerk/nextjs';
import styles from './page.module.css';

export default function BuyerProfilePage() {
  const { user } = useUser();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your account settings and shipping details</p>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Personal Info</h2>
          <div className={styles.avatarRow}>
            <div className={styles.avatar} />
            <div>
              <h3>{user?.fullName || 'User Name'}</h3>
              <p>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className="field">
              <label className="label">First Name</label>
              <input className="input" defaultValue={user?.firstName || ''} />
            </div>
            <div className="field">
              <label className="label">Last Name</label>
              <input className="input" defaultValue={user?.lastName || ''} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </section>

        <section className={styles.section}>
          <h2>Shipping Address</h2>
          <p className={styles.desc}>This address will be used by default during artwork purchases.</p>
          <div className={styles.formGrid}>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Street Address</label>
              <input className="input" placeholder="123 Gallery Lane" />
            </div>
            <div className="field">
              <label className="label">City</label>
              <input className="input" placeholder="New York" />
            </div>
            <div className="field">
              <label className="label">State / Region</label>
              <input className="input" placeholder="NY" />
            </div>
            <div className="field">
              <label className="label">Postal Code</label>
              <input className="input" placeholder="10001" />
            </div>
            <div className="field">
              <label className="label">Country</label>
              <input className="input" placeholder="United States" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Address</button>
        </section>
      </div>
    </div>
  );
}
