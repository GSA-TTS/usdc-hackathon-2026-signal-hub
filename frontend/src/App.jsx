import { useState } from 'react'
import {
  Button,
  Fieldset,
  Form,
  Grid,
  GridContainer,
  Label,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import './App.css'

function App() {
const [formData, setFormData] = useState({
  name: '',
  ssnPart1: '',
  ssnPart2: '',
  ssnPart3: '',
  email: '',
  message: '',
})

const handleSsnPartChange = (event) => {
  const { name, value, maxLength } = event.target
  const digitsOnly = value.replace(/\D/g, '').slice(0, maxLength)
  setFormData((previous) => ({
    ...previous,
    [name]: digitsOnly,
  }))
}

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    alert(`Submitted:\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`)
  }

  return (
    <GridContainer className="padding-y-8">
          <main className="form-page">
            <h1>Contact Form</h1>
            <Form onSubmit={handleSubmit} className="simple-form">

              <Fieldset legend="Social Security Number" className="ssn-fieldset">
  <div className="ssn-group">
    <TextInput
      id="ssnPart1"
      name="ssnPart1"
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3}
      value={formData.ssnPart1}
      onChange={handleSsnPartChange}
      aria-label="Social Security Number, first three digits"
      required
    />
    <span className="ssn-separator" aria-hidden="true">-</span>
    <TextInput
      id="ssnPart2"
      name="ssnPart2"
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={formData.ssnPart2}
      onChange={handleSsnPartChange}
      aria-label="Social Security Number, middle two digits"
      required
    />
    <span className="ssn-separator" aria-hidden="true">-</span>
    <TextInput
      id="ssnPart3"
      name="ssnPart3"
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={4}
      value={formData.ssnPart3}
      onChange={handleSsnPartChange}
      aria-label="Social Security Number, last four digits"
      required
    />
  </div>
</Fieldset>

              <div>
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit">Submit</Button>
            </Form>
          </main>
    </GridContainer>
  )
}

export default App
