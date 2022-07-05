import * as Docker from 'dockerode'

const docker = new Docker()
const CONTAINER_NAME = 'nextcloud-cypress-tests'

/**
 * Start the testing container
 */
export const startNextcloud = async function(branch = 'master'): Promise<string> {
	try {
		// Remove old container if exists
		try {
			const oldContainer = docker.getContainer(CONTAINER_NAME)
			await oldContainer.remove({ force: true })
		} catch (error) {}

		// Starting container
		console.log('Starting Nextcloud container...')
		console.log(`> Using branch '${branch}'`)
		const container = await docker.createContainer({
			Image: 'ghcr.io/nextcloud/continuous-integration-shallow-server',
			name: CONTAINER_NAME,
			Env: [`BRANCH=${branch}`],
		})
		await container.start()

		// Get container's IP
		let ip = await getContainerIP(container)

		console.log(`> Nextcloud container's IP is ${ip} 🌏`)
		return ip
	} catch (err) {
		console.log(err)
		stopNextcloud()
		throw new Error('> Unable to start the container 🛑')
	}
}

/**
 * Configure Nextcloud
 */
export const configureNextcloud = async function() {
	console.log('Configuring nextcloud...')
	const container = docker.getContainer(CONTAINER_NAME)
	await runExec(container, ['php', 'occ', '--version'])
	await runExec(container, ['php', 'occ', 'config:system:set', 'force_language', '--value', 'en_US'])
	await runExec(container, ['php', 'occ', 'config:system:set', 'enforce_theme', '--value', 'light'])
	console.log('> Nextcloud is now ready to use 🎉')
}

/**
 * Force stop the testing container
 */
export const stopNextcloud = async function() {
	try {
		const container = docker.getContainer(CONTAINER_NAME)
		console.log('Stopping Nextcloud container...')
		container.remove({ force: true })
		console.log('> Nextcloud container removed 🥀')
	} catch (err) {
		console.log(err)

	}
}

/**
 * Get the testing container's IP
 */
export const getContainerIP = async function(container = docker.getContainer(CONTAINER_NAME)): Promise<string> {
	let ip = ''
	let tries = 0
	while (ip === '' && tries < 10) {
		tries++

		await container.inspect(function(err, data) {
			ip = data?.NetworkSettings?.IPAddress || ''
		})

		if (ip !== '') {
			break
		}

		await sleep(1000 * tries)
	}

	return ip
}

const runExec = async function(container: Docker.Container, command: string[]) {
	const exec = await container.exec({
		Cmd: command,
		AttachStdout: true,
		AttachStderr: true,
		User: 'www-data',
	})

	await exec.start({}, (err, stream) => {
		if (stream) {
			stream.setEncoding('utf-8')
			stream.on('data', console.log)
		}
	})
}

const sleep = function(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
