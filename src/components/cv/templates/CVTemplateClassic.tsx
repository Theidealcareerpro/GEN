// theidealprogen/src/components/cv/templates/CVTemplateClassic.tsx
import * as React from "react";
import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";
import type { CVData, SectionKey } from "@/lib/cv-types";

const base = {
  page: { padding: 28, fontSize: 11, fontFamily: "Helvetica", color: "#0b0b0c" as const },
  header: { borderBottomWidth: 1, borderColor: "#e5e7eb", paddingBottom: 6, marginBottom: 8 },
  name: { fontSize: 20, fontWeight: 700 as const },
  role: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  row: { flexDirection: "row" as const, gap: 10, flexWrap: "wrap" as const, marginTop: 6 },
  label: { color: "#6b7280" },
  section: { marginTop: 10 },
  h2: { fontSize: 12, fontWeight: 700 as const, marginBottom: 6 },
  bullet: { flexDirection: "row" as const, marginBottom: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  pill: {
    fontSize: 10, color: "#111827", borderWidth: 1, borderColor: "#e5e7eb",
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 4, marginBottom: 4
  },
  small: { color: "#6b7280" },
};

export default function CVTemplateClassic({ data }: { data: CVData }) {
  const c = data.contact;
  const size = data.pdf?.pageSize || "A4";
  const scale = data.pdf?.scale ?? 1;
  const fontName = data.font === "times" ? "Times-Roman" : "Helvetica";

  const s = StyleSheet.create({
    page: { ...base.page, fontFamily: fontName, fontSize: 11 * scale },
    header: base.header,
    name: { ...base.name, fontSize: 20 * scale },
    role: base.role,
    row: base.row,
    label: base.label,
    section: base.section,
    h2: base.h2,
    bullet: base.bullet,
    bulletDot: base.bulletDot,
    bulletText: base.bulletText,
    pill: base.pill,
    small: base.small,
  });

  const show = (key: SectionKey) => !data.hiddenSections?.includes(key);
  const order = data.sectionsOrder || ["summary", "skills", "experience", "education", "projects", "certifications", "languages", "interests"];

  return (
    <Document
      title={`${data.fullName || "CV"} — Curriculum Vitae`}
      author={data.fullName || ""}
      subject="Curriculum Vitae"
      keywords="CV, Resume, TheIdealProGen"
    >
      <Page size={size} style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{data.fullName || "Your Name"}</Text>
          <Text style={s.role}>{data.role || "Your Role"}</Text>
          <View style={s.row}>
            {c.email ? <Text><Text style={s.label}>Email: </Text>{c.email}</Text> : null}
            {c.phone ? <Text><Text style={s.label}>Phone: </Text>{c.phone}</Text> : null}
            {c.website ? (
              <Text>
                <Text style={s.label}>Web: </Text>
                <Link src={c.website}>{c.website}</Link>
              </Text>
            ) : null}
            {c.location ? <Text><Text style={s.label}>Loc: </Text>{c.location}</Text> : null}
          </View>
        </View>

        {/* Sections in chosen order */}
        {order.map((sec, idx) => {
          switch (sec) {
            case "summary":
              if (!show("summary")) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Summary</Text>
                  <Text>{data.summary || "Crisp, results-oriented summary goes here (3–4 sentences)."}</Text>
                </View>
              );
            case "skills":
              if (!show("skills") || !data.skills?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Skills</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {data.skills.map((sk, i) => <Text key={i} style={s.pill}>{sk}</Text>)}
                  </View>
                </View>
              );
            case "experience":
              if (!show("experience") || !data.experience?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Experience</Text>
                  {data.experience.map((e, i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: 700 }}>{e.role} — {e.company}</Text>
                      <Text style={s.small}>{e.start} – {e.end}{e.location ? ` · ${e.location}` : ""}</Text>
                      <View style={{ marginTop: 3 }}>
                        {e.bullets.map((b, bi) => (
                          <View key={bi} style={s.bullet}>
                            <Text style={s.bulletDot}>•</Text>
                            <Text style={s.bulletText}>{b.text}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              );
            case "education":
              if (!show("education") || !data.education?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Education</Text>
                  {data.education.map((ed, i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: 700 }}>{ed.degree} — {ed.school}</Text>
                      <Text style={s.small}>{ed.start} – {ed.end}{ed.location ? ` · ${ed.location}` : ""}</Text>
                      {ed.notes ? <Text>{ed.notes}</Text> : null}
                    </View>
                  ))}
                </View>
              );
            case "projects":
              if (!show("projects") || !data.projects?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Projects</Text>
                  {data.projects.map((p, i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: 700 }}>{p.name}</Text>
                      <Text style={s.small}>{p.link ? p.link : ""}</Text>
                      <Text>{p.description}</Text>
                      {!!p.highlights?.length && (
                        <View style={{ marginTop: 3 }}>
                          {p.highlights.map((h, hi) => (
                            <View key={hi} style={s.bullet}>
                              <Text style={s.bulletDot}>•</Text>
                              <Text style={s.bulletText}>{h.text}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            case "certifications":
              if (!show("certifications") || !data.certifications?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Certifications</Text>
                  <Text>{data.certifications.join(" • ")}</Text>
                </View>
              );
            case "languages":
              if (!show("languages") || !data.languages?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Languages</Text>
                  <Text>{data.languages.join(" • ")}</Text>
                </View>
              );
            case "interests":
              if (!show("interests") || !data.interests?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Interests</Text>
                  <Text>{data.interests.join(" • ")}</Text>
                </View>
              );
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}
