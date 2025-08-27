// theidealprogen/src/components/cv/templates/CVTemplateModern.tsx
import * as React from "react";
import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";
import type { CVData, SectionKey } from "@/lib/cv-types";

export default function CVTemplateModern({ data }: { data: CVData }) {
  const size = data.pdf?.pageSize || "A4";
  const scale = data.pdf?.scale ?? 1;
  const accent = data.theme?.primary || "#6366f1";
  const fontName = data.font === "times" ? "Times-Roman" : "Helvetica";

  const s = StyleSheet.create({
    page: { padding: 28, fontFamily: fontName, fontSize: 11 * scale, color: "#0b0b0c" },
    header: { paddingBottom: 8, marginBottom: 10, borderBottomWidth: 2, borderColor: accent },
    name: { fontSize: 22 * scale, fontWeight: 700 },
    role: { fontSize: 12, color: "#374151", marginTop: 2 },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6, color: "#4b5563" },
    section: { marginTop: 12 },
    h2: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#111827" },
    pill: {
      fontSize: 10, color: "#111827", borderWidth: 1, borderColor: "#e5e7eb",
      paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 4, marginBottom: 4
    },
    small: { color: "#6b7280" },
  });

  const c = data.contact;
  const show = (key: SectionKey) => !data.hiddenSections?.includes(key);
  const order = data.sectionsOrder || ["summary","skills","experience","education","projects","certifications","languages","interests"];

  return (
    <Document
      title={`${data.fullName || "CV"} — Curriculum Vitae`}
      author={data.fullName || ""}
      subject="Curriculum Vitae"
      keywords="CV, Resume, TheIdealProGen"
    >
      <Page size={size} style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{data.fullName || "Your Name"}</Text>
          <Text style={s.role}>{data.role || "Your Role"}</Text>
          <View style={s.row}>
            {c.email ? <Text>{c.email}</Text> : null}
            {c.phone ? <Text>{c.phone}</Text> : null}
            {c.website ? <Text><Link src={c.website}>{c.website}</Link></Text> : null}
            {c.location ? <Text>{c.location}</Text> : null}
          </View>
        </View>

        {order.map((sec, idx) => {
          switch (sec) {
            case "summary":
              if (!show("summary")) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h2}>Summary</Text>
                  <Text>{data.summary || "Crisp professional summary (3–4 sentences)."}</Text>
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
                    <View key={i} style={{ marginBottom: 8 }}>
                      <Text style={{ fontWeight: 700 }}>{e.role} — {e.company}</Text>
                      <Text style={s.small}>{e.start} – {e.end}{e.location ? ` · ${e.location}` : ""}</Text>
                      <View style={{ marginTop: 3 }}>
                        {e.bullets.map((b, bi) => (
                          <View key={bi} style={{ flexDirection: "row", marginBottom: 2 }}>
                            <Text style={{ width: 10 }}>•</Text>
                            <Text style={{ flex: 1 }}>{b.text}</Text>
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
                      <Text style={s.small}>{p.link || ""}</Text>
                      <Text>{p.description}</Text>
                    </View>
                  ))}
                </View>
              );
            case "certifications":
              if (!show("certifications") || !data.certifications?.length) return null;
              return <View key={idx} style={s.section}><Text style={s.h2}>Certifications</Text><Text>{data.certifications.join(" • ")}</Text></View>;
            case "languages":
              if (!show("languages") || !data.languages?.length) return null;
              return <View key={idx} style={s.section}><Text style={s.h2}>Languages</Text><Text>{data.languages.join(" • ")}</Text></View>;
            case "interests":
              if (!show("interests") || !data.interests?.length) return null;
              return <View key={idx} style={s.section}><Text style={s.h2}>Interests</Text><Text>{data.interests.join(" • ")}</Text></View>;
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}
