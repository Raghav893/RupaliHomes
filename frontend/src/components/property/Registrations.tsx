import { ShieldCheck } from "lucide-react";
import type { Property } from "@/types";
import styles from "./PropertyDetail.module.css";

export default function Registrations({ property }: { property: Property }) {
  if (!property.reraNumber && !property.registrationsText) return null;
  return <section className={styles.registrationSection}><div className={styles.container}><div className={styles.registrationCard}><ShieldCheck size={27} strokeWidth={1.3} aria-hidden="true" /><div><p className={styles.eyebrow}>BEFORE YOU DECIDE</p><h2>Developer-published registrations</h2>{property.reraNumber && <p className={styles.registrationNumber}><span>RERA number</span>{property.reraNumber}</p>}{property.registrationsText && <p className={styles.registrationText}>{property.registrationsText}</p>}</div></div></div></section>;
}
