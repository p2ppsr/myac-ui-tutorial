import React, { useState } from 'react'
import { TextField, Button, Typography } from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import GetCertIcon from '@material-ui/icons/GetApp'

const useStyles = makeStyles(style, { name: 'Myac' })

export default () => {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleReset = async e => {
    setLoading(false)
    setResult(null)
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
          <br />
          <center className={classes.broadcast_wrap}>
            <br />
            <br />
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
