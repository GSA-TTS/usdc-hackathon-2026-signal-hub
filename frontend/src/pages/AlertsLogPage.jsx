import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function AlertsLogPage() {
  const { agency } = useOutletContext()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/alerts')
        if (!response.ok) {
          throw new Error('Unable to load alerts')
        }
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error(error)
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <div>
      <h2>Alerts Log</h2>
      <p>Cross-agency fraud match alerts created for submitted reports.</p>
      {loading ? (
        <p>Loading alerts…</p>
      ) : (
        <table className="usa-table usa-table--borderless" id="alerts-log-table">
          <thead>
            <tr>
              <th scope="col">Fraud ID</th>
              <th scope="col">Agencies</th>
              <th scope="col">Reports</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.fraudId}</td>
                <td>{alert.agencyCt}</td>
                <td>{alert.reportCt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AlertsLogPage
