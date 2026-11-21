#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
ROOT = Path("out")
ORIGIN = "https://nucasaremodelaciones.com"
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=set()
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get("id"): self.ids.add(a["id"])
        for key in ("href", "src", "poster"):
            if a.get(key): self.refs.append(a[key])
documents={}
for path in ROOT.rglob("*.html"):
    parser=Document(); parser.feed(path.read_text()); documents[path]=parser
errors=[]; checked=0
for path, doc in documents.items():
    page="/" + path.relative_to(ROOT).as_posix().removesuffix("index.html")
    for ref in doc.refs:
        if ref.startswith(("data:","mailto:","tel:","javascript:")): continue
        url=urlsplit(urljoin(ORIGIN+page,ref))
        if url.netloc!="nucasaremodelaciones.com": continue
        checked+=1
        target=ROOT/unquote(url.path.lstrip("/"))
        if url.path.endswith("/"): target=target/"index.html"
        if not target.is_file(): errors.append(f"{page}: missing {ref}")
        elif url.fragment and target in documents and unquote(url.fragment) not in documents[target].ids:
            errors.append(f"{page}: missing anchor {ref}")
        if "/NUCASA-REMODELACIONES/" in url.path: errors.append(f"{page}: old base {ref}")
if (ROOT/"CNAME").read_text().strip()!="nucasaremodelaciones.com": errors.append("Incorrect CNAME")
if len(documents)!=10: errors.append(f"Expected 10 pages, got {len(documents)}")
if errors: raise SystemExit("\n".join(errors))
print(f"Validated {len(documents)} pages and {checked} internal references.")
