// theidealprogen/src/components/cl/templates/CLTemplateModern.tsx
import * as React from "react";
import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";
import type { CLData, SectionKeyT } from "@/lib/cl-types";

export default function CLTemplateModern({ data }: { data: CLData }) {
  const size = data.pdf?.pageSize || "A4";
  const scale = data.pdf?.scale ?? 1;
  const fontName = data.font === "times" ? "Times-Roman" : "Helvetica";
  const accent = data.theme?.primary || "#6366f1";

  const s = StyleSheet.create({
    page: { padding: 28, fontFamily: fontName, fontSize: 11 * scale, color: "#0b0b0c" },
    header: { paddingBottom: 8, marginBottom: 10, borderBottomWidth: 2, borderColor: accent },
    name: { fontSize: 18 * scale, fontWeight: 700 },
    muted: { color: "#374151" },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2, color: "#4b5563" },
    section: { marginTop: 12 },
    p: { marginBottom: 6, lineHeight: 1.36 },
    bulletRow: { flexDirection: "row", marginBottom: 2 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
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
        {/* Header block */}
        {show("header") && (
          <View style={s.header}>
            <Text style={s.name}>{data.fullName || "Your Name"}</Text>
            {data.role ? <Text style={s.muted}>{data.role}</Text> : null}
            <View style={s.row}>
              {c.email ? <Text>{c.email}</Text> : null}
              {c.phone ? <Text>{c.phone}</Text> : null}
              {c.website ? <Text><Link src={c.website}>{c.website}</Link></Text> : null}
              {c.location ? <Text>{c.location}</Text> : null}
            </View>
          </View>
        )}

        {order.filter(k => k !== "header").map((sec, idx) => {
          switch (sec) {
            case "dateLine": return show("dateLine") ? <View key={idx} style={s.section}><Text>{new Date().toLocaleDateString()}</Text></View> : null;
            case "recipient":
              return show("recipient") ? (
                <View key={idx} style={s.section}>
                  {!!data.company && <Text style={{ fontWeight: 700 }}>{data.company}</Text>}
                  {!!data.jobTitle && <Text>Role: {data.jobTitle}</Text>}
                  {!!data.jobRef && <Text>Ref: {data.jobRef}</Text>}
                </View>
              ) : null;
            case "greeting": return show("greeting") ? <View key={idx} style={s.section}><Text>{data.greeting || "Dear Hiring Manager,"}</Text></View> : null;
            case "opener": return show("opener") && data.opener ? <View key={idx} style={s.section}><Text style={s.p}>{data.opener}</Text></View> : null;
            case "body":
              return show("body") && data.paragraphs?.length ? (
                <View key={idx} style={s.section}>
                  {data.paragraphs.map((p, i) => <Text key={i} style={s.p}>{p}</Text>)}
                </View>
              ) : null;
            case "highlights":
              return show("highlights") && data.highlights?.length ? (
                <View key={idx} style={s.section}>
                  {data.highlights.map((h, i) => (
                    <View key={i} style={s.bulletRow}>
                      <Text style={s.bulletDot}>•</Text>
                      <Text style={s.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              ) : null;
            case "closing": return show("closing") && data.closing ? <View key={idx} style={s.section}><Text style={s.p}>{data.closing}</Text></View> : null;
            case "signature":
              return show("signature") ? (
                <View key={idx} style={s.section}>
                  <Text>{data.signoff || "Sincerely,"}</Text>
                  <Text style={{ marginTop: 8 }}>{data.signatureName || data.fullName}</Text>
                </View>
              ) : null;
            default: return null;
          }
        })}
      </Page>
    </Document>
  );
}
