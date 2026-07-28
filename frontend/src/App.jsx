import { useState } from 'react'
import {
  Button,
  Fieldset,
  Form,
  GridContainer,
  Label,
  Radio,
  RangeInput,
  Select,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import './App.css'

// TODO: move this secret to a server-side service before production.
// Client-side secrets are visible in the JS bundle, and SSNs have low
// enough entropy (~1B combinations) to be brute-forced once the key is known.
const SSN_HMAC_SECRET = 'replace-with-a-securely-managed-secret'

async function createHmacDigest(secretKey, message) {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function App() {
  const [formData, setFormData] = useState({
    agency: '',
    ssnPart1: '',
    ssnPart2: '',
    ssnPart3: '',
    digest: '',
    severity: '',
    fraudCategory: '',
    confidence: 3,
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    const ssn = `${formData.ssnPart1}${formData.ssnPart2}${formData.ssnPart3}`
    const digest = await createHmacDigest(SSN_HMAC_SECRET, ssn)

    const { ssnPart1, ssnPart2, ssnPart3, ...rest } = formData
    const submission = { ...rest, digest }

    setFormData((previous) => ({ ...previous, digest }))
    console.log('Form data submitted:', submission)
  }

  return (
    <GridContainer className="padding-y-8">
      <main className="form-page">
        <h1>Signal Hub</h1>
        <h2>Agency Report Form</h2>
        <p>Report suspicious activity here to help identify cross-agency fraud patterns while maintaining total data security. Your submission is protected by our privacy-preserving model—identifiers are hashed locally before transmission, ensuring no raw PII is ever sent or stored.</p>
        <br />
        <p>Thank you for your work in breaking down agency silos to protect federal resources and the public we serve!</p>
        <Form onSubmit={handleSubmit} className="simple-form">

          <div>
            <Label htmlFor="fraudCategory">Agency</Label>
            <Select
              id="agency"
              name="agency"
              value={formData.agency}
              onChange={handleChange}
              required
            >
              <option value="">- Reporting Agency -</option>
              <option value="sba">SBA</option>
              <option value="ssa">SSA</option>
              <option value="hud">HUD</option>
            </Select>
          </div>

          <div>
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
          </div>

          <div>
            <Label htmlFor="fraudCategory">Fraud Primary Category</Label>
            <Select
              id="fraudCategory"
              name="fraudCategory"
              value={formData.fraudCategory}
              onChange={handleChange}
              required
            >
              <option value="">- Select -</option>
              <option value="identity-theft">Identity Theft</option>
              <option value="synthetic-identity">Synthetic Identity</option>
              <option value="loan-fraud">Loan Fraud</option>
              <option value="healthcare-fraud">Healthcare Fraud</option>
              <option value="tax-fraud">Tax Fraud</option>
              <option value="benefits-fraud">Benefits Fraud</option>
              <option value="cyber-enabled-fraud">Cyber-enabled Fraud</option>
            </Select>
          </div>

          <Fieldset legend="Severity Level" className="severity-fieldset">
            <Radio
              id="severity-low"
              name="severity"
              label="Low"
              labelDescription="Minor irregularities or administrative discrepancies."
              value="low"
              checked={formData.severity === 'low'}
              onChange={handleChange}
              required
              tile
            />
            <Radio
              id="severity-medium"
              name="severity"
              label="Medium"
              labelDescription="Significant red flags requiring further inquiry"
              value="medium"
              checked={formData.severity === 'medium'}
              onChange={handleChange}
              tile
            />
            <Radio
              id="severity-high"
              name="severity"
              label="High"
              labelDescription=" Strong indicators of potentially fraudulent activity"
              value="high"
              checked={formData.severity === 'high'}
              onChange={handleChange}
              tile
            />
            <Radio
              id="severity-critical"
              name="severity"
              label="Critical"
              labelDescription=" Immediate threat of confirmed or sophisticated fraud requiring urgent attention"
              value="critical"
              checked={formData.severity === 'critical'}
              onChange={handleChange}
              tile
            />
          </Fieldset>

          <div>
            <Label htmlFor="confidence">
              Confidence Level
              {/* TODO: Bonus for displaying the confidence level to match with slider output */}
              {/* <Tooltip
                type="button"
                label="Placeholder tooltip text — describe how confidence level should be scored."
                position="right"
                className="confidence-tooltip-trigger"
              >
                <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
                  <use href="/assets/img/sprite.svg#info"></use>
                </svg>
              </Tooltip> */}
            </Label>
            {/*
              @trussworks/react-uswds's RangeInput manages its own internal
              state and silently overrides any onChange prop passed to it, so
              controlled value/onChange do not work directly on it. Instead,
              we wrap it in a div and listen for the native 'input' event as
              it bubbles up, since React's synthetic onChange still fires for
              ancestor elements along the DOM path.
            */}
            <div
              onChange={(e) => {
                setFormData((previous) => ({
                  ...previous,
                  confidence: Number(e.target.value),
                }))
              }}
            >
              <RangeInput
                id="confidence"
                name="confidence"
                min={1}
                max={5}
                step={1}
                list="confidence-ticks"
                defaultValue={formData.confidence}
              />
            </div>
            <datalist id="confidence-ticks">
              <option value="1" label="1" />
              <option value="2" label="2" />
              <option value="3" label="3" />
              <option value="4" label="4" />
              <option value="5" label="5" />
            </datalist>
          </div>

          <Button type="submit">Submit</Button>
        </Form>
      </main>
    </GridContainer >
  )
}

export default App
