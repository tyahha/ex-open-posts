import styles from "./MainContent.module.css";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export const MainContent = ({
  children,
  className,
  contentClassName,
}: Props) => {
  return (
    <main className={clsx(styles.main, className)}>
      <div className={clsx(styles.content, contentClassName)}>{children}</div>
    </main>
  );
};
