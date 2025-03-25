import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Kimmy&apos;s Fast Foods</h3>
            <p className={styles.footerText}>Delicious meals made with love since 2010</p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              {['Home', 'Menu', 'Specials', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className={styles.footerLink}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
           
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Where To Find Us</h3>
            <p>Zakhele</p>
            <p>Manzini, M200</p>
            <p>Phone: (+268) 7959 1427</p>
          </div>
        </div>
        
        <div className={styles.copyright}>
          &copy; {currentYear} Kimmy&apos;s. All rights reserved.
        </div>
      </div>
    </footer>
  );
}