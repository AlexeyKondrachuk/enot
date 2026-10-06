"""Create deployment env files on the Actions runner without logging values."""

import os
from pathlib import Path
import re


FILES = {
    ".env.enotdev": (
        "ENOTDEV_PROXY_NETWORK",
        "ENOTDEV_POSTGRES_PASSWORD",
        "ENOTDEV_VAPID_PUBLIC_KEY",
    ),
    "deploy/enotdev/app.env": (
        "CHAT_ADMIN_PASSWORD",
        "CHAT_SESSION_SECRET",
        "VAPID_PRIVATE_KEY",
        "VAPID_SUBJECT",
    ),
}


def main():
    contents = {}
    for filename, names in FILES.items():
        lines = []
        for name in names:
            value = os.environ.get(name, "")
            # Generated hex passwords and VAPID keys need no env escaping.
            # Reject interpolation and multiline values rather than changing secrets.
            if not re.fullmatch(r"[A-Za-z0-9_:@./+=-]+", value):
                raise SystemExit(f"Missing or unsupported value for {name}")
            if name == "ENOTDEV_POSTGRES_PASSWORD" and not re.fullmatch(r"[0-9a-fA-F]+", value):
                raise SystemExit("ENOTDEV_POSTGRES_PASSWORD must be a hex password")
            if name == "VAPID_SUBJECT" and not value.startswith(("mailto:", "https://")):
                raise SystemExit("VAPID_SUBJECT must start with mailto: or https://")
            lines.append(f"{name}={value}\n")
        contents[filename] = "".join(lines)

    for filename, content in contents.items():
        path = Path(filename)
        path.parent.mkdir(parents=True, exist_ok=True)
        descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(content)


if __name__ == "__main__":
    main()
