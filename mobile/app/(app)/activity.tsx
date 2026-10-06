import { Activity as ActivityIcon, History } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Text } from "../../components/ui/Text";
import { useActivityList } from "../../hooks/use-activity";
import { useFormatters } from "../../hooks/use-preferences";
import { colors, radius, spacing } from "../../lib/theme";

export default function ActivityScreen() {
  const activities = useActivityList();
  const format = useFormatters();
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader title="Activity" fallbackHref="/(app)/more" />
      <PagedList
        query={activities}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Card style={styles.card}>
            <View style={styles.icon}>
              <ActivityIcon size={16} color={colors.primary} />
            </View>
            <View style={styles.body}>
              <Text variant="subheading">{item.title}</Text>
              {item.description ? <Text variant="bodySmall">{item.description}</Text> : null}
              <Text variant="caption">{format.dateTime(item.createdAt)}</Text>
            </View>
          </Card>
        )}
        empty={
          <EmptyState
            icon={History}
            title="No activity yet"
            message="Changes to your assets, claims, documents, and account appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  card: { flexDirection: "row", gap: spacing.md },
  icon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  body: { flex: 1, gap: 2 },
});
