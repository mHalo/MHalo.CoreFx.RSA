use std::fs;
use tauri::Emitter;
use tokio::io::AsyncWriteExt;

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

/// 下载安装包到下载目录，通过事件发送进度，完成后打开文件
#[tauri::command]
async fn download_update(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("下载请求失败: {}", e))?;

    let total = response
        .content_length()
        .unwrap_or(0);

    // 从 URL 提取文件名
    let file_name = url
        .rsplit('/')
        .next()
        .unwrap_or("update")
        .to_string();

    let downloads = dirs::download_dir()
        .or_else(|| dirs::desktop_dir())
        .ok_or("无法获取下载目录")?;
    let file_path = downloads.join(&file_name);

    let mut file = tokio::fs::File::create(&file_path)
        .await
        .map_err(|e| format!("创建文件失败: {}", e))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("下载失败: {}", e))?;
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("写入文件失败: {}", e))?;
        downloaded += chunk.len() as u64;

        // 通过事件向前端发送进度
        let _ = app.emit("update-download-progress", serde_json::json!({
            "downloaded": downloaded,
            "total": if total > 0 { total } else { 0 }
        }));
    }

    file.flush()
        .await
        .map_err(|e| format!("刷新文件失败: {}", e))?;

    // 打开安装包文件
    opener::open(&file_path.to_string_lossy().to_string())
        .map_err(|e| format!("打开安装包失败: {}", e))?;

    Ok(format!(
        "已下载 {} ({}) 并打开",
        file_name,
        human_size(if total > 0 { total } else { downloaded })
    ))
}

fn human_size(size: u64) -> String {
    if size < 1024 {
        format!("{} B", size)
    } else if size < 1024 * 1024 {
        format!("{:.1} KB", size as f64 / 1024.0)
    } else {
        format!("{:.1} MB", size as f64 / (1024.0 * 1024.0))
    }
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
            open_folder,
            download_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
