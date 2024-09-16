import styles from "./MainContent.module.css";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const MainContent = ({ children, className }: Props) => {
  return (
    <main className={clsx(styles.main, className)}>
      <div className={styles.content}>{children}</div>
    </main>
  );
};
