import { command, UsageError } from '../command.js'

command(
  'otp-status',
  {
    usage: '',
    help: 'Displays the OTP key for this account',
    needsLogin: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    if (session.account.otpKey) {
      console.log(`OTP enabled with key ${session.account.otpKey}`)
    } else console.log('OTP disabled')
    if (session.account.otpResetDate) {
      console.log(`OTP reset will occur at ${session.account.otpResetDate}`)
    } else console.log('No OTP reset pending')
  }
)

command(
  'otp-enable',
  {
    usage: '[<timeout>]',
    help: 'Enables OTP for this account',
    needsLogin: true
  },
  function (console, session, argv) {
    if (argv.length > 1) throw new UsageError(this)
    const timeout = argv[0]

    return session.account
      .enableOtp(timeout)
      .then(() => console.log(session.account.otpKey))
  }
)

command(
  'otp-disable',
  {
    usage: '',
    help: 'Disables OTP for this account',
    needsLogin: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    return session.account.disableOtp()
  }
)

command(
  'otp-reset-cancel',
  {
    usage: '',
    help: 'Cancels a pending OTP reset for this account',
    needsLogin: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    return session.account.cancelOtpResetRequest()
  }
)

command(
  'otp-reset-request',
  {
    usage: '<username> <reset token>',
    help: 'Requests an OTP reset for this account',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const username = argv[0]
    const resetToken = argv[1]

    return session.context
      .requestOtpReset(username, resetToken)
      .then(date => console.log(date))
  }
)
