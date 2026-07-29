import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function AlertsLogPage() {
  const { agency } = useOutletContext()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState('fraudId')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

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

  const filteredAlerts = alerts.filter((alert) => {
    if (!searchQuery.trim()) {
      return true
    }

    const rawValue = {
      id: alert.id,
      fraudId: alert.fraudId,
    }[searchField]

    return String(rawValue).toLowerCase().includes(searchQuery.toLowerCase())
  })

  const sortedAlerts = [...filteredAlerts].sort((left, right) => {
    if (!sortConfig.key) {
      return 0
    }

    const getValue = (alert, key) => {
      switch (key) {
        case 'id':
          return alert.id
        case 'fraudId':
          return alert.fraudId
        case 'agencies':
          return alert.agencyCt
        case 'reports':
          return alert.reportCt
        case 'alertDate':
          return alert.alertDate
        default:
          return ''
      }
    }

    const leftValue = getValue(left, sortConfig.key)
    const rightValue = getValue(right, sortConfig.key)
    const comparison = String(leftValue).localeCompare(String(rightValue), undefined, {
      numeric: true,
      sensitivity: 'base',
    })

    return sortConfig.direction === 'asc' ? comparison : -comparison
  })

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  }

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value)
  }

  const requestSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return { key, direction: 'asc' }
    })
  }

  return (
    <div>
      <h2>Alerts Log</h2>
      <p>Cross-agency fraud match alerts created for submitted reports.</p>
      {loading ? (
        <p>Loading alerts…</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '18rem' }}>
              <label className="usa-label" htmlFor="alerts-search">
                Search alerts
              </label>
              <input
                id="alerts-search"
                className="usa-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to filter"
              />
            </div>
            <div>
              <label className="usa-label" htmlFor="alerts-search-field">
                Search in
              </label>
              <select
                id="alerts-search-field"
                className="usa-select"
                value={searchField}
                onChange={handleSearchFieldChange}
              >
                <option value="fraudId">Fraud ID</option>
                <option value="id">Alert ID</option>
              </select>
            </div>
          </div>

          <table className="usa-table usa-table--borderless" id="alerts-log-table">
            <thead>
              <tr>
                <th scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Alert ID</span>
                    <button
                      type="button"
                      className="usa-button usa-button--unstyled"
                      style={{ padding: '0.25rem', minWidth: 'auto', boxShadow: 'none', border: 'none' }}
                      onClick={() => requestSort('id')}
                      aria-label="Sort by alert ID"
                    >
                      {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </th>
                <th scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Fraud ID</span>
                    <button
                      type="button"
                      className="usa-button usa-button--unstyled"
                      style={{ padding: '0.25rem', minWidth: 'auto', boxShadow: 'none', border: 'none' }}
                      onClick={() => requestSort('fraudId')}
                      aria-label="Sort by fraud ID"
                    >
                      {sortConfig.key === 'fraudId' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </th>
                <th scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Agencies</span>
                    <button
                      type="button"
                      className="usa-button usa-button--unstyled"
                      style={{ padding: '0.25rem', minWidth: 'auto', boxShadow: 'none', border: 'none' }}
                      onClick={() => requestSort('agencies')}
                      aria-label="Sort by agencies"
                    >
                      {sortConfig.key === 'agencies' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </th>
                <th scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Reports</span>
                    <button
                      type="button"
                      className="usa-button usa-button--unstyled"
                      style={{ padding: '0.25rem', minWidth: 'auto', boxShadow: 'none', border: 'none' }}
                      onClick={() => requestSort('reports')}
                      aria-label="Sort by reports"
                    >
                      {sortConfig.key === 'reports' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </th>
                <th scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Alert Date</span>
                    <button
                      type="button"
                      className="usa-button usa-button--unstyled"
                      style={{ padding: '0.25rem', minWidth: 'auto', boxShadow: 'none', border: 'none' }}
                      onClick={() => requestSort('alertDate')}
                      aria-label="Sort by alert date"
                    >
                      {sortConfig.key === 'alertDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAlerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.id}</td>
                <td>{alert.fraudId}</td>
                <td>{alert.agencyCt}</td>
                <td>{alert.reportCt}</td>
                <td>{alert.alertDate}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default AlertsLogPage
