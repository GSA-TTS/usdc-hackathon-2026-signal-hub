import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { GridContainer } from '@trussworks/react-uswds'
import NavBar from './NavBar'

function Layout({ agency, setAgency }) {
    const navigate = useNavigate()

    const handleChangeAgency = () => {
        setAgency('')
        navigate('/')
    }

    if (!agency) {
        return <Navigate to="/" replace />
    }

    return (
        <GridContainer className="padding-y-8">
            <main className="form-page">
                <h1>Signal Hub</h1>
                <NavBar agency={agency} onChangeAgency={handleChangeAgency} />
                <Outlet context={{ agency }} />
            </main>
        </GridContainer>
    )
}

export default Layout
