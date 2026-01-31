import styles from "@/styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h2 className={styles.logo}>SwiftMart</h2>
        <nav>
          <ul className={styles.navUl}>
            <li className={styles.navLink}>Home</li>
            <li className={styles.navLink}>Products</li>
            <li className={styles.navLink}>Cart</li>
            <li className={styles.navLink}>Login</li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
