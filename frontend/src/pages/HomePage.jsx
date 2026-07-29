import { useOutletContext } from 'react-router-dom'

const FAKE_REPORTS = [
  {
    id: 'RPT-1001',
    agency: 'SBA',
    fraudCategory: 'Identity Theft',
    severity: 'high',
    confidence: 4,
    submittedAt: '2026-07-21',
  },
  {
    id: 'RPT-1002',
    agency: 'SSA',
    fraudCategory: 'Synthetic Identity',
    severity: 'critical',
    confidence: 5,
    submittedAt: '2026-07-22',
  },
  {
    id: 'RPT-1003',
    agency: 'HUD',
    fraudCategory: 'Loan Fraud',
    severity: 'medium',
    confidence: 3,
    submittedAt: '2026-07-24',
  },
  {
    id: 'RPT-1004',
    agency: 'SBA',
    fraudCategory: 'Healthcare Fraud',
    severity: 'low',
    confidence: 2,
    submittedAt: '2026-07-25',
  },
  {
    id: 'RPT-1005',
    agency: 'SSA',
    fraudCategory: 'Benefits Fraud',
    severity: 'high',
    confidence: 4,
    submittedAt: '2026-07-27',
  },
]

function HomePage() {
  const { agency } = useOutletContext()

  return (
    <div>
      <h2>Submitted Reports</h2>
      {agency && (
        <p>
          Showing reports for agency: <strong>{agency.toUpperCase()}</strong>
        </p>
      )}
      <table className="usa-table usa-table--borderless" id="reports-table">
        <thead>
          <tr>
            <th scope="col">Report ID</th>
            <th scope="col">Agency</th>
            <th scope="col">Fraud Category</th>
            <th scope="col">Severity</th>
            <th scope="col">Confidence</th>
            <th scope="col">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {FAKE_REPORTS.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.agency}</td>
              <td>{report.fraudCategory}</td>
              <td>{report.severity}</td>
              <td>{report.confidence}</td>
              <td>{report.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HomePage
