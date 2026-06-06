import { SignUp } from '@clerk/nextjs';
import styles from './page.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <h1 className="font-display">Join ArtiSell</h1>
        <p>Create your account to start buying or selling original art.</p>
        <div className={styles.features}>
          {['Zero listing fees for artists','Secure payments via Stripe','Global audience of collectors','Direct payouts in 2-5 days'].map(f => (
            <div key={f} className={styles.feature}>✓ {f}</div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <SignUp />
      </div>
    </div>
  );
}
