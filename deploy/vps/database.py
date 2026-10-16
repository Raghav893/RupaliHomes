"""Run read-only database checks or back up public schema and large objects.

Run on the VPS: python3 database.py check|backup
Credentials are read from backend.env beside this script and never printed.
"""

import datetime
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import parse_qs, urlsplit


root = Path(__file__).resolve().parent
settings = dict(
    line.split("=", 1)
    for line in (root / "backend.env").read_text().splitlines()
    if line and not line.startswith("#")
)
url = urlsplit(settings["SPRING_DATASOURCE_URL"].removeprefix("jdbc:"))
environment = os.environ.copy()
environment.update(
    PGHOST=url.hostname,
    PGPORT=str(url.port or 5432),
    PGDATABASE=url.path.lstrip("/"),
    PGUSER=settings["SPRING_DATASOURCE_USERNAME"],
    PGPASSWORD=settings["SPRING_DATASOURCE_PASSWORD"],
    PGSSLMODE=parse_qs(url.query).get("sslmode", ["require"])[0],
    PGCONNECT_TIMEOUT="20",
)

if sys.argv[1] == "backup":
    backups = root / "backups"
    backups.mkdir(mode=0o700, exist_ok=True)
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = backups / f"public-before-deploy-{timestamp}.dump"
    target.touch(mode=0o600, exist_ok=False)
    subprocess.run(
        ["pg_dump", "--format=custom", "--schema=public", "--large-objects",
         "--no-owner", "--no-privileges", "--file", str(target)],
        env=environment, check=True,
    )
    subprocess.run(["pg_restore", "--list", str(target)], check=True, stdout=subprocess.DEVNULL)
    print(f"Backup verified: {target} ({target.stat().st_size} bytes)")
elif sys.argv[1] == "check":
    subprocess.run(
        ["psql", "--no-psqlrc", "--set", "ON_ERROR_STOP=1", "--command",
         "SELECT current_setting('server_version') AS server_version; "
         "SELECT count(*) AS public_tables FROM information_schema.tables "
         "WHERE table_schema = 'public' AND table_type = 'BASE TABLE'; "
         "SELECT count(*) AS property_count FROM public.properties;"],
        env=environment, check=True,
    )
else:
    raise SystemExit("Use check or backup")
