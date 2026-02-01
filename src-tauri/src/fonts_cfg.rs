use std::fs;
use std::io;
use std::path::Path;

use tauri::command;

fn decode_utf16le(bytes: &[u8]) -> io::Result<String> {
    if bytes.len() % 2 != 0 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "UTF-16LE byte length must be even",
        ));
    }

    let start = if bytes.len() >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE {
        2
    } else {
        0
    };

    let u16s: Vec<u16> = bytes[start..]
        .chunks_exact(2)
        .map(|c| u16::from_le_bytes([c[0], c[1]]))
        .collect();

    String::from_utf16(&u16s).map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Invalid UTF-16LE"))
}

fn encode_utf16le_with_bom(text: &str) -> Vec<u8> {
    let mut out = Vec::with_capacity(2 + text.len() * 2);
    out.extend_from_slice(&[0xFF, 0xFE]); // BOM
    for unit in text.encode_utf16() {
        out.extend_from_slice(&unit.to_le_bytes());
    }
    out
}

#[command]
pub fn read_fonts_cfg(path: String) -> Result<String, String> {
    let bytes = fs::read(&path)
        .map_err(|e| format!("Failed to read file: {e}"))?;

    decode_utf16le(&bytes)
        .map_err(|e| format!("Failed to decode UTF-16LE: {e}"))
}

#[command]
pub fn write_fonts_cfg(path: String, content: String) -> Result<(), String> {
    let bytes = encode_utf16le_with_bom(&content);

    // Ensure parent dir exists (needed for DEV sandbox paths)
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {e}"))?;
    }

    fs::write(&path, bytes)
        .map_err(|e| format!("Failed to write file: {e}"))?;

    Ok(())
}

#[command]
pub fn backup_fonts_cfg(path: String) -> Result<(), String> {
    let backup_path = format!("{path}.bak");

    // Only create backup if it doesn't already exist
    if fs::metadata(&backup_path).is_ok() {
        return Ok(());
    }

    fs::copy(&path, &backup_path)
        .map_err(|e| format!("Failed to back up file: {e}"))?;

    Ok(())
}

#[command]
pub fn restore_fonts_cfg(path: String) -> Result<(), String> {
    let backup_path = format!("{path}.bak");

    // If no backup exists, return a clear error
    if fs::metadata(&backup_path).is_err() {
        return Err("Backup not found. Create a backup first.".to_string());
    }

    // Restore: copy backup back to original (overwrites if original exists)
    fs::copy(&backup_path, &path)
        .map_err(|e| format!("Failed to restore from backup: {e}"))?;

    // One-shot restore: delete the backup after successful restore
    fs::remove_file(&backup_path)
        .map_err(|e| format!("Failed to remove backup file: {e}"))?;

    Ok(())
}

#[command]
pub fn fonts_cfg_exists(path: String) -> Result<bool, String> {
    Ok(fs::metadata(&path).is_ok())
}
