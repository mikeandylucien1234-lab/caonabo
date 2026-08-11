"use client";

import { useState } from "react";
import type { FaqDTO } from "@/lib/data/types";

export default function Faq({ faqs }: { faqs: FaqDTO[] }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="hz" style={{ padding: "72px 56px", background: "#faf9fc" }}>
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        <div>
          <h2
            className="font-heading"
            style={{
              fontWeight: 800,
              fontSize: 26,
              color: "#0f0f2d",
              margin: "0 0 22px",
            }}
          >
            Questions fréquentes
          </h2>
          <div>
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.id} style={{ borderBottom: "1px solid #e6e4ee" }}>
                  <div
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "18px 4px",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{ fontSize: 15, color: "#1e1b4b", fontWeight: 500 }}
                    >
                      {faq.question}
                    </span>
                    <span
                      style={{
                        color: "#dc2626",
                        fontSize: 14,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform .2s",
                      }}
                    >
                      ⌄
                    </span>
                  </div>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 4px 18px",
                        color: "#5c5c7a",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, fontSize: 14, color: "#4b4b6b" }}>
            Consultez plus au : <a href="#">Centre d&apos;Aide ↗</a>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 999,
              background: "#eef0fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 180, height: 180 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/faq-illustration.webp"
                alt="Illustration bagages / aéroport"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
