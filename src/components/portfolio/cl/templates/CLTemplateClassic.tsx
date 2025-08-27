// theidealprogen/src/components/cl/templates/CLTemplateClassic.tsx
import * as React from "react";
import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";
import type { CLData, SectionKeyT } from "@/lib/cl-types";

export default function CLTemplateClassic({ data }: { data: CLData }) {
  const size = data.pdf?.pageSize || "A4";
  const scale = data.pdf?.scale ?? 1;
  const fontName = data.font === "times" ? "Times-Roman" : "Helvetica";

  const s = StyleSheet.create({
    page: { padding: 28, fontFamily: fontName, fontSize: 11 * scale, color: "#0b0b0c" },
    h1: { fontSize: 16 * scale, fontWeight: 700, marginBottom: 2 },
    muted: { color: "#4b5563" },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
    section: { marginTop: 12 },
    p: { marginBottom: 6, lineHeight: 1.36 },
    bulletRow: { flexDirection: "row", marginBottom: 2 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
    hr: { borderBottomWidth: 1, borderColor: "#e5e7eb", marginTop: 8, marginBottom: 8 },
  });

  const c = data.contact;
  const show = (k: SectionKeyT) => !data.hiddenSections?.includes(k);
  const order = data.sectionsOrder || ["header","dateLine","recipient","greeting","opener","body","highlights","closing","signature"];

  return (
    <Document
      title={`${data.fullName || "Cover Letter"} — Cover Letter`}
      author={data.fullName || ""}
      subject="Cover Letter"
      keywords="Cover Letter, TheIdealProGen"
    >
      <Page size={size} style={s.page}>
        {order.map((sec, idx) => {
          switch (sec) {
            case "header":
              if (!show("header")) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text style={s.h1}>{data.fullName || "Your Name"}</Text>
                  {data.role ? <Text style={s.muted}>{data.role}</Text> : null}
                  <View style={s.row}>
                    {c.email ? <Text>{c.email}</Text> : null}
                    {c.phone ? <Text>{c.phone}</Text> : null}
                    {c.website ? <Text><Link src={c.website}>{c.website}</Link></Text> : null}
                    {c.location ? <Text>{c.location}</Text> : null}
                  </View>
                  <View style={s.hr} />
                </View>
              );
            case "dateLine":
              if (!show("dateLine")) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text>{new Date().toLocaleDateString()}</Text>
                </View>
              );
            case "recipient":
              if (!show("recipient")) return null;
              return (
                <View key={idx} style={s.section}>
                  {!!data.company && <Text style={{ fontWeight: 700 }}>{data.company}</Text>}
                  {!!data.jobTitle && <Text>Role: {data.jobTitle}</Text>}
                  {!!data.jobRef && <Text>Ref: {data.jobRef}</Text>}
                </View>
              );
            case "greeting":
              if (!show("greeting")) return null;
              return <View key={idx} style={s.section}><Text>{data.greeting || "Dear Hiring Manager,"}</Text></View>;
            case "opener":
              if (!show("opener") || !data.opener) return null;
              return <View key={idx} style={s.section}><Text style={s.p}>{data.opener}</Text></View>;
            case "body":
              if (!show("body") || !data.paragraphs?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  {data.paragraphs.map((p, i) => <Text key={i} style={s.p}>{p}</Text>)}
                </View>
              );
            case "highlights":
              if (!show("highlights") || !data.highlights?.length) return null;
              return (
                <View key={idx} style={s.section}>
                  {data.highlights.map((h, i) => (
                    <View key={i} style={s.bulletRow}>
                      <Text style={s.bulletDot}>•</Text>
                      <Text style={s.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              );
            case "closing":
              if (!show("closing") || !data.closing) return null;
              return <View key={idx} style={s.section}><Text style={s.p}>{data.closing}</Text></View>;
            case "signature":
              if (!show("signature")) return null;
              return (
                <View key={idx} style={s.section}>
                  <Text>{data.signoff || "Sincerely,"}</Text>
                  <Text style={{ marginTop: 8 }}>{data.signatureName || data.fullName}</Text>
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
