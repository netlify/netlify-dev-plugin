const fetch = require('node-fetch')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { fetchLatest } = require('gh-release-fetch')
const { runProcess }  = require('./run-process')

async function createTunnel(siteId, netlifyApiToken) {
  await installTunnelClient()

  console.log('Creating Live tunnel')
  const url = `https://api.netlify.com/api/v1/live_sessions?site_id=${siteId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${netlifyApiToken}`
    },
    body: JSON.stringify({}),
  })

  const data = await response.json()

  if (response.status !== 201) {
    throw new Error(data.message)
  }

  return data
}

async function connectTunnel(session, netlifyApiToken, localPort, log, error) {
  const execPath = path.join(os.homedir(), '.netlify', 'tunnel', 'bin', 'live-tunnel-client')

  const proc = {
    cmd: execPath,
    args: ['connect', '-s', session.id, '-t', netlifyApiToken, '-l', localPort]
  }

  runProcess(cmd, log, error)
}

async function installTunnelClient() {
  const binPath = path.join(os.homedir(), '.netlify', 'tunnel', 'bin')
  const execPath = path.join(binPath, 'live-tunnel-client')
  if (execExist(execPath)) {
    return
  }

  console.log('Installing Live Tunnel Client')

  const win = isWindows()
  const platform = win ? 'windows' : process.platform
  const extension = win ? 'zip' : 'tar.gz'
  release = {
    repository: 'netlify/live-tunnel-client',
    package: `live-tunnel-client-${platform}-amd64.${extension}`,
    destination: binPath,
    extract: true
  }
  await fetchLatest(release)
}

function execExist(binPath) {
  if (!fs.existsSync(binPath)) {
    return false
  }
  const stat = fs.statSync(binPath);
  return stat && stat.isFile() && isExe(stat.mode, stat.gid, stat.uid)
}

function isExe(mode, gid, uid) {
	if (isWindows()) {
		return true;
	}

	const isGroup = gid ? process.getgid && gid === process.getgid() : true;
	const isUser = uid ? process.getuid && uid === process.getuid() : true;

	return Boolean((mode & 0o0001) ||
		((mode & 0o0010) && isGroup) ||
		((mode & 0o0100) && isUser));
};

function isWindows() {
  return process.platform === 'win32'
}

module.exports = {
  createTunnel: createTunnel,
  connectTunnel: connectTunnel
}
