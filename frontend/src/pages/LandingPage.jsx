import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, GridContainer, Label, Select } from '@trussworks/react-uswds'

function LandingPage({ setAgency }) {
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    setAgency(selected)
    navigate('/home')
  }

  return (
    <GridContainer className="padding-y-8">
      <main className="form-page">
        <h1>Signal Hub</h1>
        <h2>Select Your Agency</h2>
        <p>Choose the agency you&apos;re reporting on behalf of to get started.</p>
        <Form onSubmit={handleSubmit} className="simple-form">
          <div>
            <Label htmlFor="agency">Agency</Label>
            <Select
              id="agency"
              name="agency"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              required
            >
              <option value="">- Reporting Agency -</option>
              <option value="sba">SBA</option>
              <option value="ssa">SSA</option>
              <option value="hud">HUD</option>
            </Select>
          </div>

          <Button type="submit">Continue</Button>
        </Form>
      </main>
    </GridContainer>
  )
}

export default LandingPage
