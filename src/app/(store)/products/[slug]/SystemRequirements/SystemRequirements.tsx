import type { Quantity, RequirementsBlock, SystemRequirements as Requirements } from "../types";
import styles from "./SystemRequirements.module.css";

const formatQuantity = ({ value, unit }: Quantity) => `${value} ${unit}`;

const ROWS: { label: string; format: (block: RequirementsBlock) => string }[] = [
  { label: "Sistema", format: (block) => block.os },
  { label: "Processador", format: (block) => block.processor },
  { label: "Memória", format: (block) => `${formatQuantity(block.ram)} de RAM` },
  { label: "Placa de vídeo", format: (block) => block.gpu },
  { label: "Armazenamento", format: (block) => formatQuantity(block.disk_space) },
];

export function SystemRequirements({ requirements }: { requirements: Requirements }) {
  return (
    <section className={styles.requirements} aria-labelledby="requisitos-de-sistema">
      <h2 id="requisitos-de-sistema" className={styles.title}>
        Requisitos de Sistema
      </h2>

      <table className={styles.table}>
        <thead>
          <tr className={styles.head}>
            <th scope="col">Componente</th>
            <th scope="col">Mínimos</th>
            <th scope="col">Recomendados</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, format }) => (
            <tr key={label} className={styles.row}>
              <th scope="row">{label}</th>
              <td data-label="Mínimos">{format(requirements.minimum)}</td>
              <td data-label="Recomendados">{format(requirements.recommended)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
