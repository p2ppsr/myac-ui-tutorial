import React, { useState } from 'react'
import { TextField, Button, Typography } from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import GetCertIcon from '@material-ui/icons/GetApp'

import { AuthriteClient, getDecryptedCertificates } from 'authrite-utils'

import { certificateType, certificateFields } from './myac1Certificate'

  // The public key of the certifier at that URL, must match actual public key.
  const certifierPublicKey = '025384871bedffb233fdb0b4899285d73d0f0a2b9ad18062a062c01c8bdb2f720a'
  const certifierServerURL = 'http://localhost:8081'

const useStyles = makeStyles(style, { name: 'Myac' })

export default () => {
  const classes = useStyles()

  const [domain, setDomain] = useState('twitter.com')
  const [identity, setIdentity] = useState('@bob')
  const [stake, setStake] = useState('$100')

  const [serverURL, setServerURL] = useState(certifierServerURL)
  const [loading, setLoading] = useState(false)
  const [certExists, setCertExists] = useState(false)
  const [result, setResult] = useState(null)

  const handleReset = async e => {
    setLoading(false)
    setCertExists(false)
    setResult(null)
  }

  const handleGetCert = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const client = new AuthriteClient(serverURL)

      const identifyResponse = await client.createSignedRequest('/identify', {})
      if (identifyResponse.status !== 'success' || identifyResponse.certifierPublicKey !== certifierPublicKey) {
        toast.error('Unexpected Identify Certifier Response')
        return
      }

      // If the certifier implements a confirmCertificate route, we can
      // use it to see if we're already able to provide the certificate
      // to someone who requests it, with specific field values.
      // This will fail if we do not authorize the certifier to access the certificate.
      const confirmResponse = await client.createSignedRequest('/confirmCertificate', { domain, identity })

      if (confirmResponse.status === 'success') {
        // The certifier has confirmed we already have this certificate.
        setCertExists(true)
        return;
      }

      console.log('confirmCertificate response:', confirmResponse)

      // We can use the babbage sdk to retrieve certificates we already have which
      // were issued by this certifier, of this certificate type, with specific fields:
      let certificates = await getDecryptedCertificates({
        types: Object.fromEntries([[certificateType, certificateFields]]),
        certifiers: [certifierPublicKey]
      })
      // We must implement both field value value checking to determine if
      // we already have a certificate for the current domain and identity values.
      if (certificates.some(c => c.fields.domain === domain && c.fields.identity === identity)) {
        // The Babbage SDK was able to find this certificate in our private account records.
        setCertExists(true)
        return
      }

      // Don't have a certificate yet. Request a new one.
      const newCertificateFields = {
        domain: domain,
        identity: identity,
        when: new Date().toISOString(),
        stake: stake
      }
      const certificate = await client.createCertificate({
        certificateType: certificateType,
        fieldObject: newCertificateFields,
        certifierUrl: serverURL,
        certifierPublicKey: certifierPublicKey
      })

      // It is not necessary to confirm the certificate creation in most circumstances.
      // We do it here for completeness when studying certifier behavior.
      const confirmStatus = await client.createSignedRequest('/confirmCertificate', { domain, identity })
      if ('success' === confirmStatus.status)
        console.log('CONFIRMED')
      else
        console.log('POSSIBLE ERROR: confirmCertificate status', confirmStatus)

      setResult(certificate)
    } catch (e) {
      console.error(e)
      if (e.response && e.response.data && e.response.data.description) {
        toast.error(e.response.data.description)
      } else {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={classes.content_wrap}>
      <ToastContainer />
      <center>
        <Typography variant='h4'>Authrite Certifier Tutorial UI</Typography>
        <br />
        <br />
      </center>
      {true && (
        <form>
          <Typography paragraph>
            This certifier will issue certificates to your Babbage Agent that
            establish your identity on a service identified by its domain.
          </Typography>
          <Typography paragraph>
            For example, if your Twitter handle is @bob, you would specifiy a domain of 'twitter.com'
            and an identity of '@bob'.
          </Typography>
          <Typography paragraph>
            This is an example of self-certification. Passing off a false certificate damages only your own reputation.
          </Typography>
          <Typography paragraph>
            A certifier will typically take actions to verify the claims asserted by the certificate.
            The code of this example includes comments to identify where these actions may be most readily inserted.
          </Typography>
          <TextField fullWidth variant='outlined' label='Authrite Certifier URL' value={serverURL} onChange={e => setServerURL(e.target.value)} />
          <br />
          <Typography paragraph>
            To be issued a self-certified claim of identity on a specific domain, provide a domain and identity and click 'GET CERTIFICATE'.
          </Typography>
          <TextField fullWidth variant='filled' label='Domain' value={domain} onChange={e => setDomain(e.target.value)} />
          <TextField fullWidth variant='filled' label='Identity' value={identity} onChange={e => setIdentity(e.target.value)} />
          <TextField fullWidth variant='filled' label='Stake' value={stake} onChange={e => setStake(e.target.value)} />
          <br />
          <br />
          <center className={classes.broadcast_wrap}>
            {!loading && !result && !certExists && (
            <Button
              onClick={handleGetCert}
              variant='contained'
              color='primary'
              size='large'
              disabled={loading}
              startIcon={<GetCertIcon />}
            >
              Get Certificate
            </Button>
            )}
            <br />
            <br />
            {loading && (
              <div>
                <Typography variant='h4'>Requesting new certificate!</Typography>
              </div>
            )}
            {result && (
              <div>
                <Typography variant='h4'>Success!</Typography>
              </div>
            )}
            {certExists && (
              <div>
                <Typography variant='h4'>You already have one!</Typography>
              </div>
            )}
            {!loading && (result || certExists) && (
            <Button
              onClick={handleReset}
              variant='contained'
              color='primary'
              size='large'
            >
              Reset
            </Button>
            )}
          </center>
        </form>
      )}
      <br />
      <Typography align='center'>
        Made with <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a>
      </Typography>
    </div>
  )
}
