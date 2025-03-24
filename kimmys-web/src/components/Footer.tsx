import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Kimmy's</h3>
            <p>Delicious local meals made with love</p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/menu">Menu</Link></li>
              <li><Link href="/specials">Specials</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Contact Us</h3>
            <p>123 Food Street</p>
            <p>Johannesburg, 2000</p>
            <p>Phone: (011) 123-4567</p>
          </div>
        </div>
        
        <div className={styles.copyright}>
          &copy; {currentYear} Kimmy's. All rights reserved.
        </div>
      </div>
    </footer>
  );
}