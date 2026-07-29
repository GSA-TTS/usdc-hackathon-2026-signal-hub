import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
    Button,
    DatePicker,
    Fieldset,
    Form,
    Icon,
    Label,
    Radio,
    Select,
    TextInput,
} from '@trussworks/react-uswds'

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

function ReportFormPage() {
    const { agency } = useOutletContext()

    const [formData, setFormData] = useState({
        ssnPart1: '',
        ssnPart2: '',
        ssnPart3: '',
        digest: '',
        severity: '',
        fraudCategory: '',
        confidence: '',
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
        const submission = { agency, ...rest, digest }

        setFormData((previous) => ({ ...previous, digest }))
        console.log('Form data submitted:', submission)
    }

    return (
        <div>
            <h2>Agency Report Form</h2>
            <p>Report suspicious activity here to help identify cross-agency fraud patterns while maintaining total data security. Your submission is protected by our privacy-preserving model—identifiers are hashed locally before transmission, ensuring no raw PII is ever sent or stored.</p>
            <br />
            <p>Thank you for your work in breaking down agency silos to protect federal resources and the public we serve!</p>
            <Form onSubmit={handleSubmit} className="simple-form">
                <Label htmlFor="ssnPart1">Subject Identifier</Label>
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
                    <div
                        className="usa-hint"
                        id="incident-date-hint"
                    >
                        Input is masked and hashed.
                    </div>
                </div>

                <Label
                    htmlFor="incident-date"
                    id="incident-date-label"
                >
                    Incident Date
                </Label>
                <div
                    className="usa-hint"
                    id="incident-date-hint"
                >
                    mm/dd/yyyy
                </div>
                <DatePicker
                    aria-describedby="incident-date-hint"
                    aria-labelledby="incident-date-label"
                    id="incident-date"
                    name="incident-date"
                />

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

                <Fieldset
                    legend={
                        <span className="confidence-legend-row">
                            Confidence Level
                            <Icon.InfoOutline aria-hidden="true" className="confidence-info-icon" />
                        </span>
                    }
                    className="confidence-fieldset"
                >
                    <p className="usa-hint">Indicates the level of certainty that the reported signal represents actual fraudulent activity.</p>
                    <Radio
                        id="confidence-low"
                        name="confidence"
                        label="Low"
                        labelDescription="Potential anomaly identified; requires further analysis or corroboration."
                        value="low"
                        checked={formData.confidence === 'low'}
                        onChange={handleChange}
                        required
                        tile
                    />
                    <Radio
                        id="confidence-medium"
                        name="confidence"
                        label="Medium"
                        labelDescription="Clear indicator observed; warrants additional investigation or verification."
                        value="medium"
                        checked={formData.confidence === 'medium'}
                        onChange={handleChange}
                        tile
                    />
                    <Radio
                        id="confidence-high"
                        name="confidence"
                        label="High"
                        labelDescription="Strong evidence present; consistent with established fraud patterns."
                        value="high"
                        checked={formData.confidence === 'high'}
                        onChange={handleChange}
                        tile
                    />
                    <Radio
                        id="confidence-confirmed"
                        name="confidence"
                        label="Confirmed"
                        labelDescription="Validated by agency investigation, internal review, or successful adjudication."
                        value="confirmed"
                        checked={formData.confidence === 'confirmed'}
                        onChange={handleChange}
                        tile
                    />
                </Fieldset>
                <Button type="submit">Submit</Button>
            </Form>
        </div>
    )
}

export default ReportFormPage
