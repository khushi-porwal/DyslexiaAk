import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getScreeningProgress } from "../../../constants/progressStorage";
import Svg, { G, Path, Circle, Text as TextSvg } from "react-native-svg";

const TEST_META = {
  phonological: {
    title: "Phonological Awareness",
    icon: "volume-high-outline",
    render: (data) => (
      <View className="mt-2">
        <Text className="text-gray-800">
          Score: <Text className="font-semibold">{data?.score ?? "-"}</Text>
        </Text>
        {data?.totalTasks && (
          <Text className="text-gray-600 text-xs mt-1">
            Tasks completed: {data.totalTasks}
          </Text>
        )}
      </View>
    ),
  },
  grey_reading: {
    title: "Grey Oral Reading",
    icon: "book-outline",
    render: (data) => (
      <View className="mt-2">
        <Text className="text-gray-800">
          Time: <Text className="font-semibold">{formatDuration(data?.duration)}</Text>
        </Text>
      </View>
    ),
  },
  rapid_automation: {
    title: "Rapid Automated Writing",
    icon: "pencil-outline",
    render: (data) => (
      <View className="mt-2">
        <Text className="text-gray-800">
          Target: <Text className="font-semibold">{data?.target || "-"}</Text>
        </Text>
        <Text className="text-gray-800">
          Predicted: <Text className="font-semibold">{data?.predicted || "-"}</Text>
        </Text>
        <Text className={`font-semibold mt-1 ${data?.correct ? "text-green-700" : "text-red-600"}`}>
          {data?.correct ? "Marked as correct" : "Needs improvement"}
        </Text>
      </View>
    ),
  },
  working_memory: {
    title: "Working Memory",
    icon: "bulb-outline",
    render: (data) => (
      <View className="mt-2">
        <Text className="text-gray-800">
          Accuracy: <Text className="font-semibold">{data?.accuracy ?? 0}%</Text>
        </Text>
        {data?.total !== undefined && (
          <Text className="text-gray-600 text-xs mt-1">
            {data?.correct ?? 0} of {data.total} correct
          </Text>
        )}
      </View>
    ),
  },
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function ProgressReport() {
  const router = useRouter();
  const [progress, setProgress] = useState({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const data = await getScreeningProgress();
        if (active) setProgress(data || {});
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const summary = computeSummary(progress);
  const risk = computeRisk(progress);

  const renderCard = (key) => {
    const meta = TEST_META[key];
    const data = progress?.[key];
    const isDone = !!data;

    return (
      <View
        key={key}
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name={meta.icon} size={20} color="#1F2937" />
            <Text className="ml-2 text-base font-semibold text-gray-900">
              {meta.title}
            </Text>
          </View>
          <Text
            className={`text-xs font-semibold ${
              isDone ? "text-green-700" : "text-red-500"
            }`}
          >
            {isDone ? "Completed" : "Pending"}
          </Text>
        </View>

        {isDone ? (
          <>
            {meta.render(data)}
            <Text className="text-gray-500 text-xs mt-2">
              Saved: {formatDate(data?.completedAt)}
            </Text>
          </>
        ) : (
          <Text className="text-gray-700 mt-2 text-sm">
            Finish this test to see your result here.
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#EAF3D2] px-5 pt-10">
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Progress Report</Text>
        <Ionicons name="person-circle-outline" size={28} color="#1F2937" />
      </View>

      <View className="bg-white rounded-3xl p-4 mb-5 shadow-sm border border-green-100">
        <Text className="text-gray-800 font-semibold">Screening Summary</Text>
        <Text className="text-gray-600 text-sm mt-1">
          Progress is stored on this device after you finish each screening test.
        </Text>
        <View className="flex-row mt-4 items-center">
          <CompletionDonut percent={summary.completion * 100} />
          <View className="ml-4">
            <Text className="text-2xl font-bold text-gray-900">
              {Math.round(summary.completion * 100)}% complete
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              {summary.completedCount} of 4 screenings have saved results.
            </Text>
          </View>
        </View>
      </View>

      <RiskCard risk={risk} />

      <ScorePie data={summary.segments} />

      {Object.keys(TEST_META).map(renderCard)}
    </ScrollView>
  );
}

/* ------------ Risk estimation (heuristic, non-diagnostic) ------------ */
function computeSummary(progress) {
  const phonScore = progress?.phonological?.score ?? 0;
  const phonNorm = clamp(phonScore / 13, 0, 1);

  const wmAcc = clamp((progress?.working_memory?.accuracy ?? 0) / 100, 0, 1);

  const rapidCorrect = progress?.rapid_automation
    ? progress.rapid_automation.correct
      ? 1
      : 0
    : 0;

  const greyDuration = progress?.grey_reading?.duration;
  const greyNorm = greyDuration ? clamp(1 - greyDuration / 240, 0, 1) : 0; // 4-min window

  const segments = [
    { key: "Phonological", value: phonNorm, color: "#7C3AED" },
    { key: "Grey Reading", value: greyNorm, color: "#0EA5E9" },
    { key: "Working Memory", value: wmAcc, color: "#22C55E" },
    { key: "Rapid Writing", value: rapidCorrect, color: "#F97316" },
  ];

  const completedCount = ["phonological", "grey_reading", "working_memory", "rapid_automation"].filter(
    (k) => !!progress?.[k]
  ).length;

  return {
    segments,
    completion: completedCount / 4,
    completedCount,
  };
}

function computeRisk(progress) {
  let risk = 40; // base heuristic

  const phon = progress?.phonological?.score;
  if (phon !== undefined) {
    if (phon < 6) risk += 25;
    else if (phon < 9) risk += 12;
    else risk -= 10;
  }

  const wmAcc = progress?.working_memory?.accuracy;
  if (wmAcc !== undefined) {
    if (wmAcc < 50) risk += 20;
    else if (wmAcc < 75) risk += 8;
    else risk -= 8;
  }

  const grey = progress?.grey_reading?.duration;
  if (grey !== undefined) {
    if (grey > 180) risk += 15;
    else if (grey > 120) risk += 8;
    else risk -= 5;
  }

  if (progress?.rapid_automation) {
    risk += progress.rapid_automation.correct ? -5 : 8;
  }

  const completed = ["phonological", "grey_reading", "working_memory", "rapid_automation"].filter(
    (k) => !!progress?.[k]
  ).length;
  if (completed < 2) risk += 5;

  risk = clamp(risk, 5, 95);

  const label = risk >= 70 ? "High" : risk >= 40 ? "Moderate" : "Low";
  const color = risk >= 70 ? "#DC2626" : risk >= 40 ? "#F59E0B" : "#16A34A";

  return { percent: Math.round(risk), label, color };
}

function RiskCard({ risk }) {
  return (
    <View className="bg-white rounded-3xl p-4 mb-5 shadow-sm border border-red-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="pulse-outline" size={22} color={risk.color} />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            Estimated Dyslexia Risk
          </Text>
        </View>
        <Text className="text-xs font-semibold" style={{ color: risk.color }}>
          {risk.label}
        </Text>
      </View>

      <View className="flex-row items-center mt-3">
        <View
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: `${risk.color}22` }}
        >
          <Text className="text-2xl font-bold" style={{ color: risk.color }}>
            {risk.percent}%
          </Text>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-gray-700 text-sm">
            This is a heuristic based on your saved scores and timings. It is
            not a medical diagnosis.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ------------ Pie / donut chart ------------ */
function ScorePie({ data }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const safeTotal = total || 1; // avoid divide-by-zero

  let startAngle = -90;
  const arcs = data.map((d) => {
    const sweep = (d.value / safeTotal) * 360;
    const arc = { ...d, start: startAngle, end: startAngle + sweep };
    startAngle += sweep;
    return arc;
  });

  return (
    <View className="bg-white rounded-3xl p-4 mb-6 shadow-sm border border-blue-100">
      <Text className="text-gray-900 font-semibold mb-3">Score Mix</Text>
      <View className="flex-row items-center">
        <Svg width={140} height={140}>
          <G rotation={0} originX={70} originY={70}>
            {arcs.map((arc, idx) => (
              <Path
                key={idx}
                d={describeArc(70, 70, 60, arc.start, arc.end, 36)}
                fill={arc.color}
                opacity={arc.value === 0 ? 0.08 : 0.9}
              />
            ))}
            <Circle cx={70} cy={70} r={28} fill="#fff" />
            <TextSvg
              x={70}
              y={74}
              textAnchor="middle"
              fontSize="14"
              fill="#111"
              fontWeight="bold"
            >
              {Math.round((total / data.length) * 100)}%
            </TextSvg>
          </G>
        </Svg>
        <View className="ml-4 flex-1">
          {data.map((d) => (
            <View key={d.key} className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <Text className="ml-2 text-sm text-gray-800 flex-1">
                {d.key}
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                {Math.round(d.value * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Utility to create donut arc path
function describeArc(cx, cy, outerR, startAngle, endAngle, innerR = 0) {
  const start = polarToCartesian(cx, cy, outerR, endAngle);
  const end = polarToCartesian(cx, cy, outerR, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  return [
    "M",
    start.x,
    start.y,
    "A",
    outerR,
    outerR,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    innerEnd.x,
    innerEnd.y,
    "A",
    innerR,
    innerR,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/* ------------ Completion donut ------------ */
function CompletionDonut({ percent }) {
  const angle = (percent / 100) * 360;
  return (
    <Svg width={90} height={90}>
      <G rotation={-90} originX={45} originY={45}>
        <Circle cx={45} cy={45} r={38} stroke="#E5E7EB" strokeWidth={8} fill="none" />
        <Path
          d={describeArc(45, 45, 38, 0, angle, 30)}
          stroke="#16A34A"
          strokeWidth={0}
          fill="#16A34A"
          opacity={0.9}
        />
      </G>
      <TextSvg
        x={45}
        y={50}
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#111"
      >
        {Math.round(percent)}%
      </TextSvg>
    </Svg>
  );
}
