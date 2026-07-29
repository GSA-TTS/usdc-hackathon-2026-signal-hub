import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function HomePage() {
  const { agency } = useOutletContext()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!agency) return

    const fetchReports = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/agencies/${encodeURIComponent(agency)}/signals`)
        if (!response.ok) {
          throw new Error('Unable to load signals')
        }
        const data = await response.json()
        setReports(data)
      } catch (error) {
        console.error(error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [agency])

  return (
    <div>
      <h2>Submitted Reports</h2>
      {agency && (
        <p>
          Showing reports for agency: <strong>{agency.toUpperCase()}</strong>
        </p>
      )}
      {loading ? (
        <p>Loading signals…</p>
      ) : (
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
            {reports.map((report) => (
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
      )}
    </div>
  )
}

export default HomePage
