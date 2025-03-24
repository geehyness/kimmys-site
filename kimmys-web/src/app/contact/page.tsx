// src/app/contact/page.tsx
import Layout from '@/components/Layout';
import styles from './contact.module.css'; // Create this CSS module

export default function ContactPage() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you!</p>
        {/* Add your contact information, address, phone number, email, and a contact form if you like */}
      </div>
    </Layout>
  );
}