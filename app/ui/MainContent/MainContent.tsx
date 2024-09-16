import styles from "./MainContent.module.css";

type Props = {
  children: React.ReactNode;
};

export const MainContent = ({ children }: Props) => {
  return (
    <main className={styles.main}>
      <div className={styles.content}>{children}</div>
    </main>
  );
};
