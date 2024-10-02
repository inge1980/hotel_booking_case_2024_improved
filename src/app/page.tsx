import styles from "./page.module.css";
import BookingForm from '@/components/BookingForm';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <BookingForm />
      </main>
    </div>
  );
}
