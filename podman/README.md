# How to deploy umami on podman


## How to use

1. Rename `env.sample` to `.env`
2. Edit `.env` file. At the minimum set the passwords.
3. Start umami by running `podman-compose up -d`.

If you need to stop umami, you can do so by running `podman-compose down`.


### Install systemd service (optional)

If you want to install a systemd service to run umami, you can use the provided
systemd service.

Edit `umami.service` and change these two variables:


	WorkingDirectory=/opt/apps/umami
	EnvironmentFile=/opt/apps/umami/.env

`WorkingDirectory` should be changed to the path in which `podman-compose.yml`
is located.

`EnvironmentFile` should be changed to the path in which your `.env`file is
located.

You can run the script `install-systemd-user-service` to install the systemd
service under the current user.


	./install-systemd-user-service

Note: this script will enable the service and also start it. So it will assume
that umami is not currently running.  If you started it previously, bring it
down using:

	podman-compose down



## Compatibility

These files should be compatible with podman 4.3+.

I have tested this on Debian GNU/Linux 12 (bookworm) and with the podman that
is distributed with the official Debian stable mirrors (podman
v4.3.1+ds1-8+deb12u1, podman-compose v1.0.3-3).
