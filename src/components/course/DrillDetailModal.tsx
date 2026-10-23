import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { themes } from "@/src/context/themes";
import { ClassDrill, DrillVideo, FireType } from "@/src/types/course.drills.types";

type Props = {
  classDrill: ClassDrill | null;
  /** e.g. "Month 1 · Week 2: Bill drill fundamentals" */
  weekContextLine?: string;
  /** Hide internal instructor-only notes (students). */
  hideInstructorNotes?: boolean;
  onClose: () => void;
  onWatchVideo: (drillId: number, video: DrillVideo) => void;
};

const formatPosition = (start?: string, end?: string): string => {
  const s = start?.trim();
  const e = end?.trim();
  if (s && e) return s.toLowerCase() === e.toLowerCase() ? s : `${s} -> ${e}`;
  return s ?? e ?? "";
};

const shouldAppendTargetCount = (targetSpec?: string, targetCount?: number): boolean => {
  if (targetCount == null) return false;
  if (!targetSpec?.trim()) return true;
  const normalized = targetSpec.trim().toLowerCase();
  const count = String(targetCount);
  const hasCountPrefix = new RegExp(`(^|\\s)${count}x(\\s|$)`).test(normalized);
  const hasCountSuffix = new RegExp(`(^|\\s)[x×]${count}(\\s|$)`).test(normalized);
  return !(hasCountPrefix || hasCountSuffix);
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginTop: 14 }}>
    <Text style={{ color: themes.vegasGold, fontWeight: "700", fontSize: 15, marginBottom: 6 }}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <View style={{ flexDirection: "row", marginBottom: 4 }}>
    <Text style={{ color: themes.white, opacity: 0.7, width: 140 }}>{label}</Text>
    <Text style={{ color: themes.white, flex: 1 }}>{value}</Text>
  </View>
);

const Badge = ({ label, color }: { label: string; color: string }) => (
  <View style={{ borderWidth: 1, borderColor: color, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
    <Text style={{ color, fontSize: 12, fontWeight: "600" }}>{label}</Text>
  </View>
);

export default function DrillDetailModal({
  classDrill,
  weekContextLine,
  hideInstructorNotes = false,
  onClose,
  onWatchVideo,
}: Props) {
  if (!classDrill) return null;
  const d = classDrill.drill;
  const isLive = d.fire_type === FireType.LIVE_FIRE;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: themes.black,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderWidth: 1,
            borderColor: themes.vegasGold,
            maxHeight: "85%",
            padding: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ color: themes.white, fontSize: 20, fontWeight: "700", flex: 1 }}>{d.name}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close drill details" hitSlop={10}>
              <FontAwesome name="close" size={22} color={themes.white} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {weekContextLine && (
              <Text style={{ color: themes.white, opacity: 0.7, marginBottom: 8 }}>{weekContextLine}</Text>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <Badge label={isLive ? "Live fire" : "Dry fire"} color={isLive ? "#f87171" : "#60a5fa"} />
              {classDrill.is_homework && <Badge label="Homework" color={themes.vegasGold} />}
              {classDrill.duration_minutes != null && (
                <Badge label={`${classDrill.duration_minutes} min`} color={themes.white} />
              )}
              {d.is_cte && <Badge label="CTE" color="#4ade80" />}
            </View>

            {(d.loadout?.trim() || d.distance_yards != null || d.position_start?.trim() || d.position_end?.trim()) && (
              <Section title="Setup, loadout & commands">
                {d.loadout?.trim() && <Row label="Loadout/Commands" value={d.loadout} />}
                {d.distance_yards != null && <Row label="Distance" value={`${d.distance_yards} yd`} />}
                {(d.position_start?.trim() || d.position_end?.trim()) && (
                  <Row label="Position" value={formatPosition(d.position_start, d.position_end)} />
                )}
              </Section>
            )}

            {(d.target_spec?.trim() || d.target_count != null) && (
              <Section title="Target">
                <Text style={{ color: themes.white }}>
                  {[
                    d.target_spec?.trim(),
                    shouldAppendTargetCount(d.target_spec, d.target_count) ? `×${d.target_count}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              </Section>
            )}

            {(d.rounds_total != null || d.rounds_per_string != null || d.number_of_strings != null) && (
              <Section title="Round plan">
                {d.rounds_total != null && <Row label="Total rounds" value={d.rounds_total} />}
                {d.rounds_per_string != null && <Row label="Rounds per string" value={d.rounds_per_string} />}
                {d.number_of_strings != null && <Row label="Strings" value={d.number_of_strings} />}
              </Section>
            )}

            {d.is_cte && (d.time_limit_seconds != null || d.passing_standard?.trim()) && (
              <Section title="Standard">
                {d.time_limit_seconds != null && <Row label="Time limit" value={`${d.time_limit_seconds}s`} />}
                {d.passing_standard?.trim() && <Row label="Passing" value={d.passing_standard} />}
              </Section>
            )}

            {(d.fundamentals?.length ?? 0) > 0 && (
              <Section title="Fundamentals">
                {d.fundamentals.map((f) => (
                  <Text key={f.id} style={{ color: themes.white }}>• {f.name}</Text>
                ))}
              </Section>
            )}

            {!hideInstructorNotes && d.instructor_notes?.trim() && (
              <Section title="Instructor notes">
                <Text style={{ color: themes.white }}>{d.instructor_notes}</Text>
              </Section>
            )}

            {(d.videos?.length ?? 0) > 0 && (
              <Section title="Videos">
                {(d.videos ?? []).map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => onWatchVideo(d.id, v)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      borderWidth: 1,
                      borderColor: themes.vegasGold,
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 6,
                    }}
                  >
                    <FontAwesome name="play" size={12} color={themes.vegasGold} />
                    <Text style={{ color: themes.white }}>{v.title || v.video_filename || "Watch video"}</Text>
                  </TouchableOpacity>
                ))}
              </Section>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
