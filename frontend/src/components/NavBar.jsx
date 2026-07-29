import { NavLink } from 'react-router-dom'

function NavBar({ agency, onChangeAgency }) {
  return (
    <nav className="app-nav">
      <div className="app-nav-links">
        <NavLink
          to="/form"
          className={({ isActive }) => `usa-button${isActive ? '' : ' usa-button--outline'}`}
        >
          Report Form
        </NavLink>
        <NavLink
          to="/webhook"
          className={({ isActive }) => `usa-button${isActive ? '' : ' usa-button--outline'}`}
        >
          Create Webhook
        </NavLink>
        <NavLink
          to="/id-table"
          className={({ isActive }) => `usa-button${isActive ? '' : ' usa-button--outline'}`}
        >
          View ID Table
        </NavLink>
      </div>

      {agency && (
        <p className="agency-badge">
          Reporting as: <strong>{agency.toUpperCase()}</strong>{' '}
          <button type="button" className="usa-button usa-button--unstyled" onClick={onChangeAgency}>
            Change agency
          </button>
        </p>
      )}
    </nav>
  )
}

export default NavBar
