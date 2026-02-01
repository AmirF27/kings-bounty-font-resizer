const fs = require("fs");
const path = require("path");
const { DEV_FONTS_CFG_TEXT } = require("../src/core/dev-fonts-fixture.ts");

const out = path.join(process.cwd(), "fixtures", "fonts.fixture.cfg");

// UTF-16LE with BOM
const bom = Buffer.from([0xff, 0xfe]);
const body = Buffer.from(DEV_FONTS_CFG_TEXT, "utf16le");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([bom, body]));

console.log("Wrote UTF-16LE+BOM fixture:", out);
