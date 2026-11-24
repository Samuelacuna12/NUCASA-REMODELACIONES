#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
from xml.etree import ElementTree
ROOT = Path("out")
ORIGIN = "https://nucasaremodelaciones.com"
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=set()
        self.robots = set()
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get("id"): self.ids.add(a["id"])
        if tag == "meta" and a.get("name", "").lower() == "robots":
            self.robots.update(a.get("content", "").lower().replace(",", " ").split())
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
quote_sources = set(Path("cotizaciones").glob("*/index.html"))
quote_documents = {
    path.relative_to(ROOT): doc for path, doc in documents.items()
    if path.relative_to(ROOT).parts[0] == "cotizaciones"
}
public_count = len(documents) - len(quote_documents)
if public_count != 10:
    errors.append(f"Expected 10 public site pages, got {public_count}")
for path in sorted(quote_sources - quote_documents.keys()):
    errors.append(f"Missing quote page: {path}")
for path in sorted(quote_documents.keys() - quote_sources):
    errors.append(f"Unexpected quote page: {path}")
sitemap = ElementTree.parse(ROOT / "sitemap.xml")
for location in sitemap.findall(".//{*}loc"):
    path = unquote(urlsplit(location.text or "").path)
    if path == "/cotizaciones" or path.startswith("/cotizaciones/"):
        errors.append(f"Quote listed in sitemap: {path}")
for path, doc in quote_documents.items():
    if "noindex" not in doc.robots:
        errors.append(f"Missing noindex on quote page: {path}")
if errors: raise SystemExit("\n".join(errors))
print(f"Validated {len(documents)} pages and {checked} internal references.")
