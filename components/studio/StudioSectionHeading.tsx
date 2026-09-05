import styles from "./StudioSectionHeading.module.css";

export default function StudioSectionHeading({
  index,
  word,
  eyebrow,
  title,
  description,
}: {
  index: string;
  word: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className={styles.header}>
      <span className={styles.echo} aria-hidden="true">{word}</span>
      <div className={styles.meta}>
        <span>{index}</span>
        <p>{eyebrow}</p>
      </div>
      <div className={styles.copy}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </header>
  );
}
