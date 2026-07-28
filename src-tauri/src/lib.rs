use std::fs;

/// 生成桌面保存路径：~/Desktop/rsa-keys/[keyType]-[6位随机码]/
#[tauri::command]
fn get_save_path(key_type: &str) -> Result<String, String> {
    let desktop = dirs::desktop_dir().ok_or("无法获取桌面路径")?;
    let token = random_token(6);
    let folder_name = format!("{}-{}", key_type, token);
    let parent = desktop.join("rsa-keys").join(&folder_name);
    fs::create_dir_all(&parent).map_err(|e| format!("创建目录失败: {}", e))?;
    Ok(parent.to_string_lossy().to_string())
}

/// 保存密钥文件到指定路径
#[tauri::command]
fn save_key_file(file_path: &str, content: &str) -> Result<(), String> {
    fs::write(file_path, content).map_err(|e| format!("保存文件失败: {}", e))
}

/// 用系统文件管理器打开指定文件夹
#[tauri::command]
fn open_folder(path: &str) -> Result<(), String> {
    opener::open(path).map_err(|e| format!("打开文件夹失败: {}", e))
}

fn random_token(len: usize) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let chars: Vec<char> = "abcdefghijklmnopqrstuvwxyz0123456789".chars().collect();
    let mut n = seed as usize;
    let mut out = String::with_capacity(len);
    for _ in 0..len {
        out.push(chars[n % chars.len()]);
        n = n.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
    }
    out
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_save_path,
            save_key_file,
            open_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
