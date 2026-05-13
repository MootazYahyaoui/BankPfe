import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "..", "grafana", "bank-platform-dashboard.json");
const j = JSON.stringify(JSON.parse(fs.readFileSync(jsonPath, "utf8")));
const yaml = `# Source: grafana/bank-platform-dashboard.json
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard-bank-platform
  namespace: monitoring
data:
  bank-platform-dashboard.json: ${JSON.stringify(j)}
`;
const outPath = path.join(__dirname, "grafana-dashboard-bank-platform.yaml");
fs.writeFileSync(outPath, yaml);
