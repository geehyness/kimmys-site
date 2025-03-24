// src/app/about/page.tsx
import Layout from '@/components/Layout';
import styles from './about.module.css'; // Create this CSS module

export default function AboutPage() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>About Kimmy's Spaza Studio</h1>
        <p>Welcome to Kimmy's Spaza Studio, a place where delicious, home-style meals are made with passion and the freshest local ingredients...</p>
        {/* Add more content about your story, values, team, etc. */}
      </div>
    </Layout>
  );
}