import { FileSpreadsheet, FileText } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Card, Section } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Text } from "../../components/ui/Text";
import { useReports } from "../../hooks/use-reports";
import { reports, type ReportDefinition } from "../../lib/reports-api";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function ReportsScreen() {
  const { isAdmin } = useAuth();
  const { busy, download } = useReports();

  function renderReport(report: ReportDefinition) {
    return (
      <Card key={report.id}>
        <Text variant="subheading">{report.title}</Text>
        <Text variant="bodySmall" color={colors.muted}>
          {report.description}
        </Text>
        <View style={styles.actions}>
          <Button
            title="PDF"
            icon={FileText}
            variant="outline"
            size="sm"
            style={styles.flex}
            loading={busy === `${report.id}:PDF`}
            disabled={Boolean(busy)}
            onPress={() => void download(report.id, "PDF")}
          />
          <Button
            title="Excel"
            icon={FileSpreadsheet}
            variant="secondary"
            size="sm"
            style={styles.flex}
            loading={busy === `${report.id}:EXCEL`}
            disabled={Boolean(busy)}
            onPress={() => void download(report.id, "EXCEL")}
          />
        </View>
      </Card>
    );
  }

  return (
    <Screen header={<ScreenHeader title="Reports" fallbackHref="/(app)/more" />}>
      <Text variant="bodySmall" color={colors.muted}>
        Reports are generated on the server, then opened in your share sheet so you can save or
        send them.
      </Text>
      <Section title="Your reports">{reports.filter((report) => !report.adminOnly).map(renderReport)}</Section>
      {isAdmin ? (
        <Section title="Administrator reports">
          {reports.filter((report) => report.adminOnly).map(renderReport)}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  flex: { flex: 1 },
});
