import { SignIn } from '@clerk/nextjs';
import styles from './page.module.css';

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <h1 className="font-display">Welcome back</h1>
          <p>Sign in to your ArtiSell account to manage your art and orders.</p>
        </div>
        <div className={styles.quotes}>
          <blockquote>"ArtiSell helped me reach collectors I never would have found on my own."</blockquote>
          <cite>— Mia Chen, Artist</cite>
        </div>
      </div>
      <div className={styles.right}>
        <SignIn />
      </div>
    </div>
  );
}
