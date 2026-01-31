const fs = require("fs");
const path = require("path");

const out = path.join(process.cwd(), "fixtures", "fonts.fixture.cfg");

const lines = [
  "// Synthetic test fixture",
  "Fonts {",
  "  font=calibri.ttf",
  "",
  "  ft1_12 {",
  "    default=font,14,1,1,0,0,0",
  "  }",
  "",
  "  ft1_12b {",
  "    default=font,14,1,1,1,0,0",
  "  }",
  "",
  "  ft1_11 {",
  "    default=font,13,1,1,0,0,0",
  "  }",
  "",
  "  ft1_14 {",
  "    default=font,16,1,1,0,0,0",
  "  }",
  "}",
  "",
];

const content = lines.join("\r\n");

// UTF-16LE with BOM
const bom = Buffer.from([0xff, 0xfe]);
const body = Buffer.from(content, "utf16le");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([bom, body]));

console.log("Wrote UTF-16LE+BOM fixture:", out);
