# VPS backend deployment

Target: `187.127.181.146`, application directory `/opt/rupali-backend`.
The intended API hostname is `api.rupalihomes.com`.

The API is live at `https://api.rupalihomes.com`. HTTPS and the certificate
renewal dry run were verified on October 16, 2026. HTTP requests redirect to
the HTTPS hostname. `nginx.https.conf` records the installed Nginx configuration;
`nginx.conf` is the initial HTTP configuration for bootstrapping certificates.

Backend source is available on the VPS at `/opt/rupali-backend/source`, including
`src/`, `pom.xml`, and the Maven wrapper. `/root/rupali-backend` is a shortcut to
the application directory. Source files were verified against their SHA256
manifest after upload.

The VPS uses Docker Compose, Nginx, and a Java 17 runtime image. Build the
backend locally with `backend_new/mvnw.cmd -B -DskipTests clean package`.
The current Spring context test connects to the configured database and runs
schema updates, so do not execute it against production.

Copy the JAR and this Dockerfile into a new timestamped release directory as
`app.jar` and `Dockerfile`. Build the image with a matching release tag:

```sh
cd /opt/rupali-backend
docker build -t rupali-backend:RELEASE releases/RELEASE
```

`backend.env` must be mode 600 and contain:

```dotenv
SPRING_DATASOURCE_URL=jdbc:postgresql://DATABASE_HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=DATABASE_USER
SPRING_DATASOURCE_PASSWORD=DATABASE_PASSWORD
APP_JWT_SECRET=BASE64_ENCODED_RANDOM_SECRET_AT_LEAST_32_BYTES
APP_JWT_EXPIRATION_MS=3600000
APP_SEED_ENABLED=false
SERVER_FORWARD_HEADERS_STRATEGY=framework
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=65.0 -XX:+ExitOnOutOfMemoryError
```

Database and JWT secrets are required environment variables; they are no longer
embedded in the application. Compose reads the image tag from `.env`, containing
`RUPALI_RELEASE=RELEASE`. Both environment files stay outside Git.

Before the first start, verify and back up the existing database:

```sh
python3 database.py check
python3 database.py backup
```

The backup covers the public schema, its data, and large objects, including image
data. The utility verifies the archive's table of contents. Backups stay in
`/opt/rupali-backend/backups`; no backup has been made until this command succeeds.
If the database needs schema additions for the new application version, temporarily
set `SPRING_JPA_HIBERNATE_DDL_AUTO=update`, start the app once, and return it to
`validate` after successful startup.

```sh
docker compose up -d
docker compose ps
docker compose logs --tail=100 backend
curl --fail 'http://127.0.0.1:8080/properties?page=0&size=1'
```

The container uses host networking to reach the IPv6-only direct Supabase host;
Spring binds to `127.0.0.1` so port 8080 remains private.
Nginx proxies to the backend on loopback. Its configuration blocks
`/auth/register`, because that public endpoint creates admin accounts. Enable it
only after the application passes its database checks:

```sh
ln -s /etc/nginx/sites-available/rupali-backend /etc/nginx/sites-enabled/rupali-backend
nginx -t && systemctl reload nginx
curl --fail 'http://187.127.181.146/properties?page=0&size=1'
```

After the API hostname's DNS A record points to this VPS, obtain HTTPS:

```sh
certbot --nginx -d api.rupalihomes.com --redirect
curl --fail 'https://api.rupalihomes.com/properties?page=0&size=1'
```

Check any AAAA record also points to the intended server. Keep DNS on the previous
server until the new backend passes its smoke checks. Docker and Nginx are enabled
at boot; the container restarts automatically after it has been started.
