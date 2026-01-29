use std::fs;
use std::io;
use std::path::Path;

use tempfile::tempdir;

use kings_bounty_font_resizer_lib::{
    read_fonts_cfg,
    write_fonts_cfg,
    backup_fonts_cfg,
    restore_fonts_cfg,
};

fn fixture_path() -> String {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("fixtures")
        .join("fonts.cfg")
        .to_string_lossy()
        .to_string()
}

fn read_bytes(path: &str) -> io::Result<Vec<u8>> {
    fs::read(path)
}

fn assert_has_utf16le_bom(bytes: &[u8]) {
    assert!(bytes.len() >= 2, "expected at least 2 bytes for BOM");
    assert_eq!(bytes[0], 0xFF, "expected UTF-16LE BOM");
    assert_eq!(bytes[1], 0xFE, "expected UTF-16LE BOM");
}

#[test]
fn read_fixture_decodes_utf16le() {
    let tmp = tempdir().unwrap();
    let tmp_file = tmp.path().join("fonts.cfg");
    fs::copy(fixture_path(), &tmp_file).unwrap();

    let text = read_fonts_cfg(tmp_file.to_string_lossy().to_string()).unwrap();
    assert!(!text.is_empty());
    assert!(text.contains("default=font,"));
}

#[test]
fn write_preserves_utf16le_bom_and_persists_content() {
    let tmp = tempdir().unwrap();
    let tmp_file = tmp.path().join("fonts.cfg");
    fs::copy(fixture_path(), &tmp_file).unwrap();

    let p = tmp_file.to_string_lossy().to_string();
    let original = read_fonts_cfg(p.clone()).unwrap();

    let modified = format!("{original}\nTEST_SENTINEL=1");
    write_fonts_cfg(p.clone(), modified).unwrap();

    let bytes = read_bytes(&p).unwrap();
    assert_has_utf16le_bom(&bytes);
    assert_eq!(bytes.len() % 2, 0);

    let reread = read_fonts_cfg(p).unwrap();
    assert!(reread.contains("TEST_SENTINEL=1"));
}

#[test]
fn backup_is_created_once_and_not_overwritten() {
    let tmp = tempdir().unwrap();
    let tmp_file = tmp.path().join("fonts.cfg");
    fs::copy(fixture_path(), &tmp_file).unwrap();

    let p = tmp_file.to_string_lossy().to_string();
    let bak = format!("{p}.bak");

    backup_fonts_cfg(p.clone()).unwrap();
    assert!(Path::new(&bak).exists());

    let sentinel = "DO_NOT_OVERWRITE";
    write_fonts_cfg(bak.clone(), sentinel.to_string()).unwrap();

    backup_fonts_cfg(p.clone()).unwrap();

    let reread = read_fonts_cfg(bak).unwrap();
    assert!(reread.contains(sentinel));
}

#[test]
fn restore_restores_and_deletes_backup() {
    let tmp = tempdir().unwrap();
    let tmp_file = tmp.path().join("fonts.cfg");
    fs::copy(fixture_path(), &tmp_file).unwrap();

    let p = tmp_file.to_string_lossy().to_string();
    let bak = format!("{p}.bak");

    let original = read_fonts_cfg(p.clone()).unwrap();

    backup_fonts_cfg(p.clone()).unwrap();

    write_fonts_cfg(
        p.clone(),
        format!("{original}\nMODIFIED=1"),
    ).unwrap();

    restore_fonts_cfg(p.clone()).unwrap();

    let restored = read_fonts_cfg(p.clone()).unwrap();
    assert_eq!(restored, original);
    assert!(!Path::new(&bak).exists());
}

#[test]
fn restore_errors_when_backup_missing() {
    let tmp = tempdir().unwrap();
    let tmp_file = tmp.path().join("fonts.cfg");
    fs::copy(fixture_path(), &tmp_file).unwrap();

    let p = tmp_file.to_string_lossy().to_string();
    let err = restore_fonts_cfg(p).unwrap_err();

    assert!(
        err.to_lowercase().contains("backup not found"),
        "unexpected error: {err}"
    );
}
