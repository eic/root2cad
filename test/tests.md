Manual testing (meh)

```bash
xvfb-run node ../index.mjs --ls --ls-depth=0 drich.root DRICH

xvfb-run node ../index.mjs --ls --ls-depth=1 drich.root DRICH

xvfb-run node ../index.mjs --ls drich.root

# non existent object
xvfb-run node ../index.mjs --ls drich.root WRONGNAME

# non existent file
xvfb-run node ../index.mjs --ls drich.rott

```