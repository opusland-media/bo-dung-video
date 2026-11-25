/**
 * HỘP NHẬN FILE — nhận video/ảnh thành phẩm từ Claude trên đám mây,
 * lưu vào thư mục "Video thành phẩm" trên Google Drive của CHÍNH người cài.
 *
 * Cài 1 lần:
 *  1. script.google.com → Dự án mới → dán toàn bộ file này → Lưu.
 *  2. Chạy hàm caiDat (nút ▶) → bấm Cho phép quyền Drive → xem Nhật ký thực thi để lấy MÃ BÍ MẬT.
 *  3. Triển khai → Triển khai mới → Loại: Ứng dụng web
 *       Thực thi với tư cách: Tôi   |   Ai có quyền truy cập: Bất kỳ ai
 *     → Sao chép URL ứng dụng web.
 *  4. Dán URL + MÃ BÍ MẬT vào Biến môi trường của môi trường đám mây Claude:
 *       DRIVE_HOP_URL=...   DRIVE_HOP_KEY=...
 * Không ai gửi được file vào Drive nếu không có MÃ BÍ MẬT.
 */
var TEN_THU_MUC = 'Video thành phẩm';

function caiDat() {
  var p = PropertiesService.getScriptProperties();
  var key = p.getProperty('KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '');
    p.setProperty('KEY', key);
  }
  var folder = layThuMuc_();
  // Gọi thử API để Google xin luôn quyền gọi mạng ngoài.
  UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  });
  Logger.log('MÃ BÍ MẬT (DRIVE_HOP_KEY): ' + key);
  Logger.log('Thư mục nhận file: ' + folder.getUrl());
}

function layThuMuc_() {
  var p = PropertiesService.getScriptProperties();
  var id = p.getProperty('FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) {}
  }
  var it = DriveApp.getFoldersByName(TEN_THU_MUC);
  var f = it.hasNext() ? it.next() : DriveApp.createFolder(TEN_THU_MUC);
  p.setProperty('FOLDER_ID', f.getId());
  return f;
}

function traVe_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return traVe_({ ok: true, msg: 'Hộp nhận file đang chạy' });
}

/**
 * POST JSON:
 *  {key, action:'start', name, mimeType, size}  → {ok, uploadUrl}  (Claude PUT file thẳng vào uploadUrl)
 *  {key, action:'link', fileId}                  → {ok, url}        (bật "ai có link đều xem", trả link)
 */
function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return traVe_({ ok: false, error: 'JSON lỗi' }); }
  var key = PropertiesService.getScriptProperties().getProperty('KEY');
  if (!key || body.key !== key) return traVe_({ ok: false, error: 'Sai mã bí mật' });

  if (body.action === 'start') {
    var folder = layThuMuc_();
    var meta = { name: String(body.name || 'file'), parents: [folder.getId()] };
    var res = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink',
      {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify(meta),
        headers: {
          Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
          'X-Upload-Content-Type': body.mimeType || 'application/octet-stream',
          'X-Upload-Content-Length': String(body.size || '')
        },
        muteHttpExceptions: true
      });
    var loc = res.getHeaders()['Location'] || res.getHeaders()['location'];
    if (!loc) return traVe_({ ok: false, error: 'Không tạo được phiên tải lên', detail: res.getContentText() });
    return traVe_({ ok: true, uploadUrl: loc, folder: folder.getUrl() });
  }

  if (body.action === 'link') {
    var f = DriveApp.getFileById(body.fileId);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return traVe_({ ok: true, url: f.getUrl() });
  }
  return traVe_({ ok: false, error: 'action không hợp lệ' });
}
