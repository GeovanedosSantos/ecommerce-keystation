import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import styles from "./ContentNotFound.module.css";

export function ContentNotFound() {
  return (
    <PageContainer width="xl" paddingY="2xl" gap="none">
      <section className={styles.error404} aria-labelledby="error-404-title">
        <div className={styles.error404__grid}>
          {/* Coluna da Esquerda: Mensagem & Ações */}
          <div className={styles.error404__content}>
            {/* 1. Tag / Badge superior */}
            <div className={styles.error404__badge} role="status">
              <span className={styles["error404__badge-dot"]} aria-hidden="true" />
              <span>ERRO 404 · FORA DO MAPA</span>
            </div>

            {/* 2. Título Principal (H1) */}
            <h1 id="error-404-title" className={styles.error404__title}>
              Oops! Game Over. Esta página não existe.
            </h1>

            {/* 3. Parágrafo Descritivo */}
            <p className={styles.error404__description}>
              Parece que essa fase ainda não foi desbloqueada. Volte para a base e
              encontre sua próxima aventura.
            </p>

            {/* 4 & 5. Ações de Navegação */}
            <div className={styles.error404__actions}>
              {/* Botão Primário (CTA) */}
              <Button
                href="/"
                variant="primary"
                size="lg"
                inline
                className={styles.error404__cta}
              >
                <ArrowLeft
                  size={20}
                  className={styles["error404__cta-icon"]}
                  aria-hidden="true"
                />
                <span>Voltar para a Base (Home)</span>
              </Button>

              {/* Link Secundário de Navegação */}
              <Link
                href="/catalog"
                className={styles["error404__secondary-link"]}
              >
                Ou explore o catálogo de jogos →
              </Link>
            </div>
          </div>

          {/* Coluna da Direita: Painel Visual 404 */}
          <div className={styles.error404__visual} aria-hidden="true">
            <div className={styles.error404__card}>
              <div className={styles["error404__card-grid"]} />

              {/* Partículas flutuantes em gravidade zero */}
              <span
                className={`${styles.error404__particle} ${styles["error404__particle--1"]}`}
              />
              <span
                className={`${styles.error404__particle} ${styles["error404__particle--2"]}`}
              />
              <span
                className={`${styles.error404__particle} ${styles["error404__particle--3"]}`}
              />
              <span
                className={`${styles.error404__particle} ${styles["error404__particle--4"]}`}
              />

              {/* Composição Gráfica 404 + Controle Translúcido */}
              <div className={styles["error404__floating-wrapper"]}>
                <svg
                  className={styles.error404__svg}
                  viewBox="0 0 400 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Gradientes Neon */}
                    <linearGradient
                      id="textGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#A855F7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.85" />
                    </linearGradient>

                    <linearGradient
                      id="strokeGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>

                    <linearGradient
                      id="gamepadGlass"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
                    </linearGradient>

                    <linearGradient
                      id="cyanAccent"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>

                    <linearGradient
                      id="purpleAccent"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>

                    {/* Filtro de Glow */}
                    <filter
                      id="neonGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Círculos e linhas de radar / telemetria em segundo plano */}
                  <circle
                    cx="200"
                    cy="160"
                    r="120"
                    stroke="#8B5CF6"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="200"
                    cy="160"
                    r="85"
                    stroke="#06B6D4"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />

                  {/* Número 404 estilizado em display holográfico */}
                  <g filter="url(#neonGlow)">
                    {/* Primeiro 4 */}
                    <text
                      x="70"
                      y="190"
                      textAnchor="middle"
                      fontSize="130"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="url(#textGrad)"
                      stroke="url(#strokeGrad)"
                      strokeWidth="2"
                      opacity="0.9"
                    >
                      4
                    </text>

                    {/* Zero central integrado */}
                    <text
                      x="200"
                      y="190"
                      textAnchor="middle"
                      fontSize="130"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="url(#textGrad)"
                      stroke="url(#strokeGrad)"
                      strokeWidth="2"
                      opacity="0.3"
                    >
                      0
                    </text>

                    {/* Segundo 4 */}
                    <text
                      x="330"
                      y="190"
                      textAnchor="middle"
                      fontSize="130"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="url(#textGrad)"
                      stroke="url(#strokeGrad)"
                      strokeWidth="2"
                      opacity="0.9"
                    >
                      4
                    </text>
                  </g>

                  {/* Controle de Videogame Translúcido Estilizado */}
                  <g transform="translate(90, 85)">
                    {/* Sombra / Glow do Controle */}
                    <path
                      d="M40 50 C55 35, 75 35, 110 35 C145 35, 165 35, 180 50 C195 65, 215 110, 205 135 C198 150, 175 155, 155 130 C140 115, 130 115, 110 115 C90 115, 80 115, 65 130 C45 155, 22 150, 15 135 C5 110, 25 65, 40 50 Z"
                      fill="#8B5CF6"
                      opacity="0.25"
                      filter="url(#neonGlow)"
                    />

                    {/* Corpo Translúcido do Controle */}
                    <path
                      d="M40 50 C55 35, 75 35, 110 35 C145 35, 165 35, 180 50 C195 65, 215 110, 205 135 C198 150, 175 155, 155 130 C140 115, 130 115, 110 115 C90 115, 80 115, 65 130 C45 155, 22 150, 15 135 C5 110, 25 65, 40 50 Z"
                      fill="url(#gamepadGlass)"
                      stroke="url(#strokeGrad)"
                      strokeWidth="2"
                    />

                    {/* Gatilhos Superiores (L1/R1, L2/R2) */}
                    <rect
                      x="48"
                      y="26"
                      width="32"
                      height="8"
                      rx="4"
                      fill="rgba(30, 41, 59, 0.9)"
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="140"
                      y="26"
                      width="32"
                      height="8"
                      rx="4"
                      fill="rgba(30, 41, 59, 0.9)"
                      stroke="#06B6D4"
                      strokeWidth="1.5"
                    />

                    {/* D-Pad (Direcional em Cruz) à Esquerda */}
                    <g transform="translate(48, 65)">
                      <path
                        d="M10 2 H16 V10 H24 V16 H16 V24 H10 V16 H2 V10 H10 Z"
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                      />
                      {/* Setas luminosas no D-Pad */}
                      <circle cx="13" cy="6" r="1.5" fill="#06B6D4" />
                      <circle cx="13" cy="20" r="1.5" fill="#06B6D4" />
                      <circle cx="6" cy="13" r="1.5" fill="#06B6D4" />
                      <circle cx="20" cy="13" r="1.5" fill="#06B6D4" />
                    </g>

                    {/* Botões de Ação à Direita (A, B, X, Y) */}
                    <g transform="translate(145, 65)">
                      {/* Top (Y) */}
                      <circle
                        cx="14"
                        cy="4"
                        r="5"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke="#8B5CF6"
                        strokeWidth="1.5"
                      />
                      <circle cx="14" cy="4" r="2" fill="#8B5CF6" />

                      {/* Right (B) */}
                      <circle
                        cx="24"
                        cy="14"
                        r="5"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke="#F43F5E"
                        strokeWidth="1.5"
                      />
                      <circle cx="24" cy="14" r="2" fill="#F43F5E" />

                      {/* Bottom (A) */}
                      <circle
                        cx="14"
                        cy="24"
                        r="5"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke="#10B981"
                        strokeWidth="1.5"
                      />
                      <circle cx="14" cy="24" r="2" fill="#10B981" />

                      {/* Left (X) */}
                      <circle
                        cx="4"
                        cy="14"
                        r="5"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                      />
                      <circle cx="4" cy="14" r="2" fill="#06B6D4" />
                    </g>

                    {/* Analógicos Duplos (Joysticks) */}
                    {/* Analógico Esquerdo */}
                    <g transform="translate(80, 88)">
                      <circle
                        cx="14"
                        cy="14"
                        r="14"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="rgba(139, 92, 246, 0.5)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="14"
                        cy="14"
                        r="8"
                        fill="#1E293B"
                        stroke="#8B5CF6"
                        strokeWidth="1.5"
                      />
                      <circle cx="14" cy="14" r="3" fill="#A855F7" />
                    </g>

                    {/* Analógico Direito */}
                    <g transform="translate(112, 88)">
                      <circle
                        cx="14"
                        cy="14"
                        r="14"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="rgba(6, 182, 212, 0.5)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="14"
                        cy="14"
                        r="8"
                        fill="#1E293B"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                      />
                      <circle cx="14" cy="14" r="3" fill="#38BDF8" />
                    </g>

                    {/* Emblema Central / Power KeyStation */}
                    <g transform="translate(102, 54)">
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        fill="#0F172A"
                        stroke="url(#strokeGrad)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5 8 L8 5 L11 8 L8 11 Z"
                        fill="url(#cyanAccent)"
                      />
                    </g>

                    {/* Linhas de circuito / Dados no controle */}
                    <path
                      d="M45 105 Q 60 110, 75 102"
                      stroke="rgba(6, 182, 212, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <path
                      d="M175 105 Q 160 110, 145 102"
                      stroke="rgba(139, 92, 246, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                  </g>

                  {/* Partículas de gravidade zero dentro do SVG */}
                  <polygon
                    points="310,60 314,64 310,68 306,64"
                    fill="#38BDF8"
                    opacity="0.8"
                  />
                  <polygon
                    points="70,100 74,104 70,108 66,104"
                    fill="#C084FC"
                    opacity="0.8"
                  />
                  <circle cx="340" cy="240" r="2.5" fill="#06B6D4" opacity="0.6" />
                  <circle cx="60" cy="250" r="3" fill="#8B5CF6" opacity="0.7" />
                  <circle cx="200" cy="30" r="2" fill="#F43F5E" opacity="0.5" />
                </svg>
              </div>

              {/* Barra de telemetria / Status da Zona */}
              <div className={styles["error404__card-footer"]}>
                <span className={styles["error404__signal-status"]}>
                  <span className={styles["error404__signal-beacon"]} />
                  SIGNAL LOST
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
