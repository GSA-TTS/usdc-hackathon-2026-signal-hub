```txt
@trussworks/react-uswds
```

paired with the U.S. Web Design System package:

```txt
@uswds/uswds
```

That is a good fit for this PoC. We can keep the same FastAPI backend and replace the custom React styling with USWDS components and `usa-*` classes.

---

## 1. Install USWDS and TrussWorks React USWDS

From the frontend folder:

```bash
cd fs3-poc/frontend
npm install @trussworks/react-uswds @uswds/uswds
```

---

## 2. Update `src/main.jsx`

Replace `frontend/src/main.jsx` with:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "@uswds/uswds/dist/css/uswds.min.css";
import "./styles.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

We do not need the USWDS JavaScript bundle for this version because we are not using accordions, modals, dropdown navigation, or other JS-enhanced USWDS components yet.

---

## 3. Replace `src/styles.css`

Replace `frontend/src/styles.css` with this smaller USWDS-compatible custom file:

```css
body {
  background: #f7f9fa;
}

.fs3-shell {
  min-height: 100vh;
}

.fs3-header {
  background: #112f4e;
  color: white;
}

.fs3-header p,
.fs3-header h1 {
  color: white;
}

.fs3-card {
  background: white;
  border: 1px solid #dfe1e2;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.fs3-panel-title {
  margin-top: 0;
}

.fs3-code {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  background: #f0f0f0;
  color: #1b1b1b;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace;
  font-size: 0.87rem;
}

.fs3-json {
  background: #1b1b1b;
  color: #f0f0f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.87rem;
  line-height: 1.45;
}

.fs3-transform-row {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dfe1e2;
}

.fs3-transform-row:last-child {
  border-bottom: 0;
}

.fs3-transform-label {
  font-weight: 700;
  color: #565c65;
}

.fs3-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.fs3-badge-active {
  background: #dfeacd;
  color: #2e5e1a;
}

.fs3-badge-withdrawn,
.fs3-badge-retracted {
  background: #f8dfe2;
  color: #b50909;
}

.fs3-badge-default {
  background: #e7f6f8;
  color: #005ea8;
}

.fs3-event {
  border-top: 1px solid #dfe1e2;
  padding-top: 1rem;
  margin-top: 1rem;
}

.fs3-muted {
  color: #565c65;
}

.fs3-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.fs3-table-wrap {
  overflow-x: auto;
}

.fs3-stat {
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 0.5rem;
}

.fs3-stat strong {
  display: block;
  font-size: 2rem;
}

@media (max-width: 40em) {
  .fs3-transform-row {
    grid-template-columns: 1fr;
  }
}
```

---

## 4. Replace `src/App.jsx` with USWDS version

Replace `frontend/src/App.jsx` with:

```jsx
import { useEffect, useMemo, useState } from "react";
import { Alert, Button } from "@trussworks/react-uswds";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const DEMO_HMAC_KEY = "demo-key-1";

const AGENCIES = {
  SSA: {
    id: "SSA",
    name: "Social Security Administration",
    apiKey: "demo-ssa-key",
  },
  SBA: {
    id: "SBA",
    name: "Small Business Administration",
    apiKey: "demo-sba-key",
  },
  HUD: {
    id: "HUD",
    name: "Department of Housing and Urban Development",
    apiKey: "demo-hud-key",
  },
  GSA: {
    id: "GSA",
    name: "General Services Administration",
    apiKey: "demo-gsa-key",
  },
};

const SIGNAL_PRESETS = {
  SSA: {
    fraud_category: "identity_fraud",
    signal_type: "identity:ssn_misuse",
    confidence: "0.92",
    severity: "high",
  },
  SBA: {
    fraud_category: "loan_fraud",
    signal_type: "loan:application_anomaly",
    confidence: "0.87",
    severity: "high",
  },
  HUD: {
    fraud_category: "housing_fraud",
    signal_type: "housing:eligibility_inconsistency",
    confidence: "0.81",
    severity: "medium",
  },
  GSA: {
    fraud_category: "procurement_fraud",
    signal_type: "procurement:vendor_risk_signal",
    confidence: "0.75",
    severity: "medium",
  },
};

const DEFAULT_REPORT_FORM = {
  identifier: "123-45-6789",
  ...SIGNAL_PRESETS.SSA,
};

function canonicalizeIdentifier(value) {
  return value.replace(/\D/g, "");
}

async function hmacSha256Hex(secretKey, message) {
  const encoder = new TextEncoder();

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stringifyError(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.detail) {
    if (typeof error.detail === "string") return error.detail;
    if (error.detail.error) return error.detail.error;
    return JSON.stringify(error.detail);
  }
  if (error.error) return error.error;
  return JSON.stringify(error);
}

function ShortDigest({ value }) {
  if (!value) {
    return <span className="fs3-muted">Not generated yet</span>;
  }

  return (
    <code className="fs3-code" title={value}>
      {value.slice(0, 16)}...{value.slice(-12)}
    </code>
  );
}

function JsonBlock({ value }) {
  return <pre className="fs3-json">{JSON.stringify(value, null, 2)}</pre>;
}

function StatusBadge({ status }) {
  const className =
    status === "active"
      ? "fs3-badge fs3-badge-active"
      : status === "withdrawn"
      ? "fs3-badge fs3-badge-withdrawn"
      : status === "retracted"
      ? "fs3-badge fs3-badge-retracted"
      : "fs3-badge fs3-badge-default";

  return <span className={className}>{status}</span>;
}

export default function App() {
  const [agencyId, setAgencyId] = useState("SSA");
  const agency = AGENCIES[agencyId];

  const [reportForm, setReportForm] = useState(DEFAULT_REPORT_FORM);
  const [reportDigest, setReportDigest] = useState("");
  const [reportResult, setReportResult] = useState(null);
  const [reportError, setReportError] = useState("");

  const [searchIdentifier, setSearchIdentifier] = useState("123-45-6789");
  const [searchDigest, setSearchDigest] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedAlertError, setSelectedAlertError] = useState("");

  const [myReports, setMyReports] = useState([]);
  const [myReportsError, setMyReportsError] = useState("");

  const [webhookEvents, setWebhookEvents] = useState([]);
  const [webhookError, setWebhookError] = useState("");

  const [gsaDashboard, setGsaDashboard] = useState(null);
  const [gsaError, setGsaError] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "X-Agency-ID": agency.id,
      "X-API-Key": agency.apiKey,
    }),
    [agency]
  );

  const reportCanonical = canonicalizeIdentifier(reportForm.identifier);
  const searchCanonical = canonicalizeIdentifier(searchIdentifier);

  const reportApiPayload = {
    subject_digest: reportDigest || "<computed-client-side>",
    fraud_category: reportForm.fraud_category,
    signal_type: reportForm.signal_type,
    confidence: Number(reportForm.confidence),
    severity: reportForm.severity,
  };

  useEffect(() => {
    let cancelled = false;

    async function computeDigest() {
      if (!reportCanonical) {
        setReportDigest("");
        return;
      }

      const digest = await hmacSha256Hex(DEMO_HMAC_KEY, reportCanonical);

      if (!cancelled) {
        setReportDigest(digest);
      }
    }

    computeDigest();

    return () => {
      cancelled = true;
    };
  }, [reportCanonical]);

  useEffect(() => {
    let cancelled = false;

    async function computeDigest() {
      if (!searchCanonical) {
        setSearchDigest("");
        return;
      }

      const digest = await hmacSha256Hex(DEMO_HMAC_KEY, searchCanonical);

      if (!cancelled) {
        setSearchDigest(digest);
      }
    }

    computeDigest();

    return () => {
      cancelled = true;
    };
  }, [searchCanonical]);

  useEffect(() => {
    setReportForm((current) => ({
      ...current,
      ...SIGNAL_PRESETS[agencyId],
    }));

    setReportResult(null);
    setReportError("");
    setSearchError("");
    setSelectedAlert(null);
    setSelectedAlertError("");
  }, [agencyId]);

  useEffect(() => {
    refreshMyReports();
    refreshWebhookEvents();

    if (agencyId === "GSA") {
      refreshGsaDashboard();
    } else {
      setGsaDashboard(null);
      setGsaError("");
    }

    const interval = setInterval(() => {
      refreshWebhookEvents();
      if (agencyId === "GSA") {
        refreshGsaDashboard();
      }
    }, 2500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, headers]);

  async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw data || { error: `Request failed with status ${response.status}` };
    }

    return data;
  }

  async function submitReport(event) {
    event.preventDefault();
    setReportResult(null);
    setReportError("");

    if (!reportDigest) {
      setReportError("Identifier must produce a digest before submission.");
      return;
    }

    try {
      const result = await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          subject_digest: reportDigest,
          fraud_category: reportForm.fraud_category,
          signal_type: reportForm.signal_type,
          confidence: Number(reportForm.confidence),
          severity: reportForm.severity,
        }),
      });

      setReportResult(result);
      await refreshMyReports();
      await refreshWebhookEvents();

      if (agencyId === "GSA") {
        await refreshGsaDashboard();
      }
    } catch (error) {
      setReportError(stringifyError(error));
    }
  }

  async function searchAlerts(event) {
    event.preventDefault();
    setSearchError("");
    setSearchResults([]);

    if (!searchDigest) {
      setSearchError("Identifier must produce a digest before search.");
      return;
    }

    try {
      const result = await apiFetch("/alerts/search", {
        method: "POST",
        body: JSON.stringify({
          subject_digests: [searchDigest],
        }),
      });

      setSearchResults(result.alerts || []);
    } catch (error) {
      setSearchError(stringifyError(error));
    }
  }

  async function retrieveAlert(alertId = selectedAlertId) {
    setSelectedAlert(null);
    setSelectedAlertError("");

    if (!alertId) {
      setSelectedAlertError("Enter or select an alert ID.");
      return;
    }

    try {
      const result = await apiFetch(`/alerts/${alertId}`, {
        method: "GET",
      });

      setSelectedAlert(result);
      setSelectedAlertId(result.id);
    } catch (error) {
      setSelectedAlertError(stringifyError(error));
    }
  }

  async function refreshMyReports() {
    setMyReportsError("");

    try {
      const result = await apiFetch("/reports/mine", {
        method: "GET",
      });

      setMyReports(result.reports || []);
    } catch (error) {
      setMyReportsError(stringifyError(error));
    }
  }

  async function retractReport(reportId) {
    try {
      await apiFetch(`/reports/${reportId}/retract`, {
        method: "POST",
      });

      await refreshMyReports();
      await refreshWebhookEvents();

      if (agencyId === "GSA") {
        await refreshGsaDashboard();
      }
    } catch (error) {
      window.alert(`Retraction failed: ${stringifyError(error)}`);
    }
  }

  async function refreshWebhookEvents() {
    setWebhookError("");

    try {
      const result = await apiFetch("/webhook-events", {
        method: "GET",
      });

      setWebhookEvents(result.events || []);
    } catch (error) {
      setWebhookError(stringifyError(error));
    }
  }

  async function refreshGsaDashboard() {
    setGsaError("");

    try {
      const result = await apiFetch("/gsa/dashboard", {
        method: "GET",
      });

      setGsaDashboard(result);
    } catch (error) {
      setGsaError(stringifyError(error));
    }
  }

  function applyTamperDemo() {
    setSearchIdentifier("123-45-6780");
  }

  return (
    <div className="fs3-shell">
      <section className="fs3-header padding-y-4">
        <div className="grid-container">
          <p className="text-bold text-uppercase margin-bottom-1">
            Fraud Signal Sharing Service
          </p>
          <h1 className="font-heading-xl margin-y-1">
            FS3 Privacy-Preserving Fraud Correlation PoC
          </h1>
          <p className="font-body-lg measure-6 margin-top-1">
            Demonstrates cross-agency fraud signal matching using client-side
            HMAC digests. Raw identifiers are never sent to the API.
          </p>
        </div>
      </section>

      <main className="grid-container padding-y-4">
        <Alert
          type="warning"
          heading="Proof-of-concept key handling notice"
          headingLevel="h2"
          className="margin-bottom-4"
        >
          The shared HMAC key is intentionally present in browser code so the
          demo can visibly show plaintext input becoming a digest before API
          submission. This is not a production-safe key management model.
        </Alert>

        <section className="fs3-card margin-bottom-4">
          <h2 className="fs3-panel-title">Agency context</h2>

          <div className="grid-row grid-gap">
            <div className="tablet:grid-col-6">
              <label className="usa-label" htmlFor="agency">
                Simulated agency
              </label>
              <select
                className="usa-select"
                id="agency"
                value={agencyId}
                onChange={(event) => setAgencyId(event.target.value)}
              >
                {Object.values(AGENCIES).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} — {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="tablet:grid-col-6">
              <p className="margin-top-3 margin-bottom-1">
                <strong>Demo request headers</strong>
              </p>
              <p className="margin-y-05">
                <code className="fs3-code">X-Agency-ID: {agency.id}</code>
              </p>
              <p className="margin-y-05">
                <code className="fs3-code">X-API-Key: {agency.apiKey}</code>
              </p>
            </div>
          </div>
        </section>

        <div className="grid-row grid-gap">
          <section className="tablet:grid-col-7 margin-bottom-4">
            <div className="fs3-card">
              <h2 className="fs3-panel-title">Submit fraud report</h2>
              <p className="fs3-muted">
                FR-1: Raw identifier is transformed in the browser. Only the
                digest is submitted to the API.
              </p>

              <form className="usa-form usa-form--large" onSubmit={submitReport}>
                <label className="usa-label" htmlFor="report-identifier">
                  Subject identifier
                </label>
                <input
                  className="usa-input"
                  id="report-identifier"
                  value={reportForm.identifier}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      identifier: event.target.value,
                    })
                  }
                  placeholder="123-45-6789"
                />

                <label className="usa-label" htmlFor="fraud-category">
                  Fraud category
                </label>
                <input
                  className="usa-input"
                  id="fraud-category"
                  value={reportForm.fraud_category}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      fraud_category: event.target.value,
                    })
                  }
                />

                <label className="usa-label" htmlFor="signal-type">
                  Signal type
                </label>
                <input
                  className="usa-input"
                  id="signal-type"
                  value={reportForm.signal_type}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      signal_type: event.target.value,
                    })
                  }
                />

                <label className="usa-label" htmlFor="confidence">
                  Confidence
                </label>
                <input
                  className="usa-input"
                  id="confidence"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={reportForm.confidence}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      confidence: event.target.value,
                    })
                  }
                />

                <label className="usa-label" htmlFor="severity">
                  Severity
                </label>
                <select
                  className="usa-select"
                  id="severity"
                  value={reportForm.severity}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      severity: event.target.value,
                    })
                  }
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>

                <div className="border-1px border-base-lighter radius-md padding-2 margin-y-3">
                  <h3 className="margin-top-0">Client-side transformation</h3>

                  <div className="fs3-transform-row">
                    <span className="fs3-transform-label">Plaintext input</span>
                    <code className="fs3-code">
                      {reportForm.identifier || "None"}
                    </code>
                  </div>

                  <div className="fs3-transform-row">
                    <span className="fs3-transform-label">Canonicalized</span>
                    <code className="fs3-code">
                      {reportCanonical || "None"}
                    </code>
                  </div>

                  <div className="fs3-transform-row">
                    <span className="fs3-transform-label">
                      HMAC-SHA-256 digest
                    </span>
                    <ShortDigest value={reportDigest} />
                  </div>

                  <h4>API payload, no raw PII</h4>
                  <JsonBlock value={reportApiPayload} />
                </div>

                <Button type="submit">Submit hashed fraud report</Button>
              </form>

              {reportError && (
                <Alert type="error" heading="Submission error" headingLevel="h3">
                  {reportError}
                </Alert>
              )}

              {reportResult && (
                <Alert
                  type={reportResult.matched ? "success" : "info"}
                  heading={
                    reportResult.matched
                      ? "Cross-agency match detected"
                      : "Report stored"
                  }
                  headingLevel="h3"
                  className="margin-top-3"
                >
                  <JsonBlock value={reportResult} />
                </Alert>
              )}
            </div>
          </section>

          <section className="tablet:grid-col-5 margin-bottom-4">
            <div className="fs3-card">
              <h2 className="fs3-panel-title">Search alerts</h2>
              <p className="fs3-muted">
                FR-3: Search uses the hashed identifier, not the raw identifier.
              </p>

              <form className="usa-form" onSubmit={searchAlerts}>
                <label className="usa-label" htmlFor="search-identifier">
                  Subject identifier to search
                </label>
                <input
                  className="usa-input"
                  id="search-identifier"
                  value={searchIdentifier}
                  onChange={(event) => setSearchIdentifier(event.target.value)}
                  placeholder="123-45-6789"
                />

                <p>
                  <strong>Search digest:</strong>{" "}
                  <ShortDigest value={searchDigest} />
                </p>

                <div className="fs3-button-row margin-top-2">
                  <Button type="submit">Hash and search</Button>
                  <button
                    type="button"
                    className="usa-button usa-button--outline"
                    onClick={applyTamperDemo}
                  >
                    Tamper demo
                  </button>
                </div>
              </form>

              {searchError && (
                <Alert type="error" heading="Search error" headingLevel="h3">
                  {searchError}
                </Alert>
              )}

              <h3>Search results</h3>

              {searchResults.length === 0 ? (
                <p className="fs3-muted">No matching alerts returned.</p>
              ) : (
                searchResults.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-top-1px border-base-lighter padding-top-2 margin-top-2"
                  >
                    <p>
                      <strong>Alert ID:</strong>{" "}
                      <code className="fs3-code">{alert.id}</code>
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <StatusBadge status={alert.status} />
                    </p>
                    <p>
                      <strong>Category:</strong> {alert.primary_category}
                    </p>
                    <p>
                      <strong>Agencies:</strong>{" "}
                      {alert.corroboration.agency_count}
                    </p>
                    <p>
                      <strong>Reports:</strong>{" "}
                      {alert.corroboration.report_count}
                    </p>
                    <p>
                      <strong>Severity:</strong> {alert.max_severity}
                    </p>
                    <button
                      type="button"
                      className="usa-button usa-button--outline"
                      onClick={() => retrieveAlert(alert.id)}
                    >
                      Retrieve full alert
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="grid-row grid-gap">
          <section className="tablet:grid-col-5 margin-bottom-4">
            <div className="fs3-card">
              <h2 className="fs3-panel-title">Retrieve alert</h2>
              <p className="fs3-muted">
                FR-4: Alert detail exposes corroboration metadata, not raw PII or
                individual report contents.
              </p>

              <label className="usa-label" htmlFor="alert-id">
                Alert ID
              </label>
              <input
                className="usa-input"
                id="alert-id"
                value={selectedAlertId}
                onChange={(event) => setSelectedAlertId(event.target.value)}
                placeholder="alt_..."
              />

              <Button
                type="button"
                className="margin-top-2"
                onClick={() => retrieveAlert()}
              >
                Retrieve alert
              </Button>

              {selectedAlertError && (
                <Alert
                  type="error"
                  heading="Alert retrieval error"
                  headingLevel="h3"
                >
                  {selectedAlertError}
                </Alert>
              )}

              {selectedAlert && <JsonBlock value={selectedAlert} />}
            </div>
          </section>

          <section className="tablet:grid-col-7 margin-bottom-4">
            <div className="fs3-card">
              <div className="display-flex flex-justify">
                <div>
                  <h2 className="fs3-panel-title">
                    {agency.id} local reports
                  </h2>
                  <p className="fs3-muted">
                    FR-6 / FR-7: Each agency can see and retract only its own
                    reports.
                  </p>
                </div>

                <button
                  type="button"
                  className="usa-button usa-button--outline"
                  onClick={refreshMyReports}
                >
                  Refresh
                </button>
              </div>

              {myReportsError && (
                <Alert type="error" heading="Report load error" headingLevel="h3">
                  {myReportsError}
                </Alert>
              )}

              {myReports.length === 0 ? (
                <p className="fs3-muted">
                  No reports visible for this agency context.
                </p>
              ) : (
                <div className="fs3-table-wrap">
                  <table className="usa-table usa-table--borderless width-full">
                    <thead>
                      <tr>
                        <th scope="col">Report ID</th>
                        <th scope="col">Digest</th>
                        <th scope="col">Category</th>
                        <th scope="col">Signal</th>
                        <th scope="col">Severity</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReports.map((report) => (
                        <tr key={report.id}>
                          <td>
                            <code className="fs3-code">{report.id}</code>
                          </td>
                          <td>
                            <ShortDigest value={report.subject_digest} />
                          </td>
                          <td>{report.fraud_category}</td>
                          <td>{report.signal_type}</td>
                          <td>{report.severity}</td>
                          <td>
                            <StatusBadge status={report.status} />
                          </td>
                          <td>
                            {report.status === "active" ? (
                              <button
                                type="button"
                                className="usa-button usa-button--secondary"
                                onClick={() => retractReport(report.id)}
                              >
                                Retract
                              </button>
                            ) : (
                              <span className="fs3-muted">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="fs3-card margin-bottom-4">
          <div className="display-flex flex-justify">
            <div>
              <h2 className="fs3-panel-title">{agency.id} webhook log</h2>
              <p className="fs3-muted">
                FR-5: Shows simulated webhook notifications received by the
                active agency context.
              </p>
            </div>

            <button
              type="button"
              className="usa-button usa-button--outline"
              onClick={refreshWebhookEvents}
            >
              Refresh
            </button>
          </div>

          {webhookError && (
            <Alert type="error" heading="Webhook log error" headingLevel="h3">
              {webhookError}
            </Alert>
          )}

          {webhookEvents.length === 0 ? (
            <p className="fs3-muted">No webhook events received yet.</p>
          ) : (
            webhookEvents.map((event) => (
              <div key={event.id} className="fs3-event">
                <p className="margin-bottom-05">
                  <strong>{event.event_type}</strong>
                </p>
                <p className="fs3-muted margin-y-05">
                  {new Date(event.delivered_at).toLocaleString()}
                </p>
                <p>
                  <strong>Alert:</strong>{" "}
                  <code className="fs3-code">{event.alert_id}</code>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {event.payload?.alert?.status || "unknown"}
                </p>
                <p>
                  <strong>Digest:</strong>{" "}
                  <ShortDigest value={event.payload?.alert?.subject_digest} />
                </p>
              </div>
            ))
          )}
        </section>

        {agencyId === "GSA" && (
          <section className="fs3-card margin-bottom-4">
            <div className="display-flex flex-justify">
              <div>
                <h2 className="fs3-panel-title">GSA dashboard</h2>
                <p className="fs3-muted">
                  FR-8: GSA-privileged view across alerts and report lifecycle
                  counts.
                </p>
              </div>

              <button
                type="button"
                className="usa-button usa-button--outline"
                onClick={refreshGsaDashboard}
              >
                Refresh
              </button>
            </div>

            {gsaError && (
              <Alert type="error" heading="GSA dashboard error" headingLevel="h3">
                {gsaError}
              </Alert>
            )}

            {!gsaDashboard ? (
              <p className="fs3-muted">No dashboard data loaded.</p>
            ) : (
              <>
                <div className="grid-row grid-gap margin-bottom-3">
                  <div className="tablet:grid-col-4">
                    <div className="fs3-stat">
                      <span>Alerts</span>
                      <strong>{gsaDashboard.summary.alert_count}</strong>
                    </div>
                  </div>
                  <div className="tablet:grid-col-4">
                    <div className="fs3-stat">
                      <span>Active reports</span>
                      <strong>
                        {gsaDashboard.summary.active_report_count}
                      </strong>
                    </div>
                  </div>
                  <div className="tablet:grid-col-4">
                    <div className="fs3-stat">
                      <span>Retracted reports</span>
                      <strong>
                        {gsaDashboard.summary.retracted_report_count}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="fs3-table-wrap">
                  <table className="usa-table width-full">
                    <thead>
                      <tr>
                        <th scope="col">Alert ID</th>
                        <th scope="col">Digest</th>
                        <th scope="col">Category</th>
                        <th scope="col">Signals</th>
                        <th scope="col">Severity</th>
                        <th scope="col">Agencies</th>
                        <th scope="col">Reports</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsaDashboard.alerts.map((alert) => (
                        <tr key={alert.id}>
                          <td>
                            <code className="fs3-code">{alert.id}</code>
                          </td>
                          <td>
                            <ShortDigest value={alert.subject_digest} />
                          </td>
                          <td>{alert.primary_category}</td>
                          <td>{alert.signal_types.join(", ")}</td>
                          <td>{alert.max_severity}</td>
                          <td>{alert.corroboration.agency_count}</td>
                          <td>{alert.corroboration.report_count}</td>
                          <td>
                            <StatusBadge status={alert.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
```

---

## 5. Run it

Backend:

```bash
cd fs3-poc/backend
uvicorn app:app --reload --port 8000
```

Frontend:

```bash
cd fs3-poc/frontend
npm run dev
```

Open:

```txt
http://localhost:5173
```

---

## 6. What changed

This keeps the same FS3 functionality but changes the design system to use:

- USWDS layout classes such as `grid-container`, `grid-row`, `grid-gap`
- USWDS form classes such as `usa-input`, `usa-select`, `usa-label`
- USWDS table classes such as `usa-table`
- USWDS button classes such as `usa-button`, `usa-button--outline`
- TrussWorks React USWDS components for `Alert` and `Button`

I also changed the default signal types from agency-prefixed values like:

```txt
ssa:ssn_misuse
sba:loan_application_anomaly
```

to more attribution-neutral values like:

```txt
identity:ssn_misuse
loan:application_anomaly
```

That better supports the PoC requirement that alerts do not expose contributing agencies.



